import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import QuizSession from '../models/QuizSession';
import QuestionAttempt from '../models/QuestionAttempt';
import Question from '../models/Question';
import User from '../models/User';
import { SUBJECTS, Subject, QUIZ_TYPES, QuizType } from '../config/constants';

/**
 * POST /api/sessions/start
 * Generates questions based on config, creates a QuizSession, and returns both.
 */
export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, topics, count, quizType = 'practice', timeLimit, timerMode } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Not authenticated' });
      return;
    }

    // Basic validation
    if (!subject || !SUBJECTS.includes(subject as Subject)) {
      res.status(400).json({ status: 'error', message: `Invalid subject.` });
      return;
    }
    if (!QUIZ_TYPES.includes(quizType as QuizType)) {
      res.status(400).json({ status: 'error', message: `Invalid quizType.` });
      return;
    }

    let activeTopics = topics;
    let requestedCount = parseInt(count, 10);

    // --- Generation Logic (Similar to old generateQuiz) ---
    const availabilityAgg = await Question.aggregate([
      { $match: { subject: subject as string, topic: { $in: topics } } },
      { $group: { _id: '$topic', count: { $sum: 1 } } },
    ]);

    const availableMap: Record<string, number> = {};
    for (const item of availabilityAgg) {
      availableMap[item._id] = item.count;
    }

    const totalAvailable = Object.values(availableMap).reduce((s, c) => s + c, 0);

    if (totalAvailable === 0) {
      res.status(404).json({ status: 'error', message: 'No questions found for the selected criteria' });
      return;
    }

    const effectiveCount = Math.min(requestedCount, totalAvailable);
    activeTopics = topics.filter((t: string) => (availableMap[t] || 0) > 0);

    const perTopic = Math.floor(effectiveCount / activeTopics.length);
    let remainder = effectiveCount % activeTopics.length;

    const quotas: Record<string, number> = {};
    for (const t of activeTopics) {
      quotas[t] = perTopic + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    }

    let deficit = 0;
    for (const t of activeTopics) {
      const available = availableMap[t] || 0;
      if (quotas[t] > available) {
        deficit += quotas[t] - available;
        quotas[t] = available;
      }
    }

    if (deficit > 0) {
      for (const t of activeTopics) {
        if (deficit <= 0) break;
        const available = availableMap[t] || 0;
        const spare = available - quotas[t];
        if (spare > 0) {
          const add = Math.min(spare, deficit);
          quotas[t] += add;
          deficit -= add;
        }
      }
    }

    const allQuestions: any[] = [];
    for (const t of activeTopics) {
      const quota = quotas[t];
      if (quota <= 0) continue;

      const topicQuestions = await Question.aggregate([
        { $match: { subject: subject as string, topic: t } },
        { $sample: { size: quota } },
      ]);
      allQuestions.push(...topicQuestions);
    }

    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }
    // -----------------------------------------------------

    // Create the QuizSession
    const newSession = await QuizSession.create({
      userId,
      quizType,
      subject,
      topics,
      config: {
        totalQuestions: allQuestions.length,
        timeLimit: timeLimit || 0,
        timerMode: timerMode || 'total',
      },
      status: 'in-progress',
    });

    res.status(201).json({
      status: 'success',
      data: {
        session: newSession,
        questions: allQuestions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * POST /api/sessions/:id/answer
 * Record a single answer for a session. Upserts to handle retries/changes if allowed.
 */
export const recordAnswer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // Session ID
    const { questionId, selectedOption, timeTaken } = req.body;
    const userId = req.user?._id;

    const session = await QuizSession.findOne({ _id: id, userId });
    if (!session) {
      res.status(404).json({ status: 'error', message: 'Session not found' });
      return;
    }

    if (session.status !== 'in-progress') {
      res.status(400).json({ status: 'error', message: 'Session is already completed' });
      return;
    }

    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({ status: 'error', message: 'Question not found' });
      return;
    }

    const isCorrect = selectedOption === question.answer;

    // Use upsert to allow updating an answer if they change it before final submission
    // (Depending on quiz rules, maybe we only allow one insert)
    await QuestionAttempt.findOneAndUpdate(
      { sessionId: id, questionId, userId },
      {
        subject: question.subject,
        topic: question.topic,
        selectedOption,
        isCorrect,
        timeTaken: timeTaken || 0,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      status: 'success',
      data: { isCorrect, correctAnswer: question.answer },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * POST /api/sessions/:id/complete
 * Finalize the session, aggregate results, and update user stats.
 */
export const completeSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;
    const { timeTaken, maxStreak } = req.body; // Passed from frontend

    const session = await QuizSession.findOne({ _id: id, userId });
    if (!session) {
      res.status(404).json({ status: 'error', message: 'Session not found' });
      return;
    }

    if (session.status === 'completed') {
      res.status(200).json({ status: 'success', data: { session } });
      return;
    }

    // Calculate results based on QuestionAttempts
    const attempts = await QuestionAttempt.find({ sessionId: id });
    
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const incorrectCount = attempts.filter((a) => !a.isCorrect && a.selectedOption !== null).length;
    
    // Unanswered = total - attempted
    const attemptedCount = attempts.filter((a) => a.selectedOption !== null).length;
    const unansweredCount = session.config.totalQuestions - attemptedCount;

    const score = session.config.totalQuestions > 0 
      ? Math.round((correctCount / session.config.totalQuestions) * 100) 
      : 0;

    // Update Session
    session.results = {
      correctCount,
      incorrectCount,
      unansweredCount,
      score,
      timeTaken: timeTaken || 0,
      maxStreak: maxStreak || 0,
    };
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    // Update User Stats (atomic)
    await User.findByIdAndUpdate(userId, {
      $inc: {
        'stats.totalQuizzes': 1,
        'stats.totalQuestions': session.config.totalQuestions,
        'stats.totalCorrect': correctCount,
      },
      $set: {
        'stats.lastActiveAt': new Date(),
      }
    });

    // To compute a running average, we ideally do it here, but it requires reading the updated stats
    const updatedUser = await User.findById(userId);
    if (updatedUser) {
      const newAvgScore = updatedUser.stats.totalQuizzes > 0 
        ? Math.round((updatedUser.stats.totalCorrect / updatedUser.stats.totalQuestions) * 100)
        : 0;
      
      const newBestStreak = Math.max(updatedUser.stats.bestStreak || 0, maxStreak || 0);

      updatedUser.stats.avgScore = newAvgScore;
      updatedUser.stats.bestStreak = newBestStreak;
      await updatedUser.save();
    }

    res.status(200).json({
      status: 'success',
      data: { session },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/sessions
 * List past sessions for the user.
 */
export const listSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 10, subject, quizType } = req.query;

    const query: any = { userId, status: { $in: ['completed', 'in-progress'] } };
    if (subject) query.subject = subject;
    if (quizType) query.quizType = quizType;

    const skip = (Number(page) - 1) * Number(limit);

    const sessions = await QuizSession.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await QuizSession.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        sessions,
        meta: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/sessions/:id
 * Get details of a specific session, including all attempts.
 */
export const getSessionDetail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const session = await QuizSession.findOne({ _id: id, userId });
    if (!session) {
      res.status(404).json({ status: 'error', message: 'Session not found' });
      return;
    }

    const attempts = await QuestionAttempt.find({ sessionId: id })
      .populate('questionId') // To show the actual question text and options on review
      .sort({ createdAt: 1 });

    res.status(200).json({
      status: 'success',
      data: {
        session,
        attempts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
