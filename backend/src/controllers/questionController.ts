import { Response } from 'express';
import multer from 'multer';
import Question from '../models/Question';
import { AuthRequest } from '../middlewares/authMiddleware';
import { SUBJECTS, Subject } from '../config/constants';

// Multer config — store file in memory as buffer
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

/**
 * POST /api/questions/upload
 * Admin uploads a JSON file of questions for a chosen subject.
 * Skips duplicate questions (matched by question text + subject).
 */
export const uploadQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject } = req.body;

    // Validate subject
    if (!subject || !SUBJECTS.includes(subject as Subject)) {
      res.status(400).json({
        status: 'error',
        message: `Invalid subject. Must be one of: ${SUBJECTS.join(', ')}`,
      });
      return;
    }

    // Validate file
    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'Please upload a JSON file' });
      return;
    }

    // Parse JSON from file buffer
    let questionsData: any[];
    try {
      questionsData = JSON.parse(req.file.buffer.toString('utf-8'));
    } catch {
      res.status(400).json({ status: 'error', message: 'Invalid JSON file format' });
      return;
    }

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      res.status(400).json({ status: 'error', message: 'JSON file must contain a non-empty array of questions' });
      return;
    }

    // Extract all question texts from the uploaded file for duplicate check
    const incomingQuestionTexts = questionsData.map((q) => q.question);

    // Find existing questions with the same text and subject
    const existingQuestions = await Question.find({
      question: { $in: incomingQuestionTexts },
      subject,
    }).select('question');

    const existingTexts = new Set(existingQuestions.map((q) => q.question));

    // Filter out duplicates and map to the Question schema
    const newQuestions = questionsData
      .filter((q) => !existingTexts.has(q.question))
      .map((q) => {
        let processedAnswer = q.answer;
        if (typeof processedAnswer === 'string') {
          const lowerAns = processedAnswer.trim().toLowerCase();
          if (/^option[1-4]$/.test(lowerAns)) {
            processedAnswer = q[lowerAns] || processedAnswer;
          }
        }

        return {
          question: q.question,
          option1: q.option1,
          option2: q.option2,
          option3: q.option3,
          option4: q.option4,
          answer: processedAnswer,
          subject,
          topic: q.topic,
          subTopic: q['sub topic'] || q.subTopic || '',
          examYearAndType: q.examyearandtype || q.examYearAndType || '',
          uploadedBy: req.user!._id,
        };
      });

    let insertedCount = 0;
    if (newQuestions.length > 0) {
      const inserted = await Question.insertMany(newQuestions);
      insertedCount = inserted.length;
    }

    const skippedCount = questionsData.length - newQuestions.length;

    res.status(201).json({
      status: 'success',
      data: {
        totalInFile: questionsData.length,
        inserted: insertedCount,
        skippedDuplicates: skippedCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/questions
 * Fetch questions with optional filters and pagination.
 * Query params: subject, topic, subTopic, examYearAndType, page, limit
 */
export const getQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, topic, subTopic, examYearAndType, page = '1', limit = '20' } = req.query;

    const filter: any = {};
    if (subject) filter.subject = subject;
    if (topic) filter.topic = { $regex: topic, $options: 'i' };
    if (subTopic) filter.subTopic = { $regex: subTopic, $options: 'i' };
    if (examYearAndType) filter.examYearAndType = { $regex: examYearAndType, $options: 'i' };

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [questions, total] = await Promise.all([
      Question.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
      Question.countDocuments(filter),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        questions,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/questions/subjects
 * Returns the list of available subjects.
 */
export const getSubjects = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.status(200).json({
    status: 'success',
    data: { subjects: SUBJECTS },
  });
};

/**
 * GET /api/questions/topics
 * Returns distinct topics for a given subject.
 * Query params: subject (required)
 */
export const getTopics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject } = req.query;

    if (!subject) {
      res.status(400).json({ status: 'error', message: 'Subject query param is required' });
      return;
    }

    const topics = await (Question as any).distinct('topic', { subject });

    res.status(200).json({
      status: 'success',
      data: { topics },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/questions/subtopics
 * Returns distinct sub-topics for a given subject and topic.
 * Query params: subject (required), topic (required)
 */
export const getSubTopics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, topic } = req.query;

    if (!subject || !topic) {
      res.status(400).json({ status: 'error', message: 'Subject and topic query params are required' });
      return;
    }

    const subTopics = await (Question as any).distinct('subTopic', { subject, topic });

    res.status(200).json({
      status: 'success',
      data: { subTopics },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * DELETE /api/questions/:id
 * Admin deletes a single question by ID.
 */
export const deleteQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      res.status(404).json({ status: 'error', message: 'Question not found' });
      return;
    }

    res.status(200).json({
      status: 'success',
      message: 'Question deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/questions/topics-with-count
 * Returns topics for a subject along with how many questions exist per topic.
 * Query params: subject (required)
 */
export const getTopicsWithCount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject } = req.query;

    if (!subject) {
      res.status(400).json({ status: 'error', message: 'Subject query param is required' });
      return;
    }

    const topicsAgg = await Question.aggregate([
      { $match: { subject: subject as string } },
      { $group: { _id: '$topic', count: { $sum: 1 } } },
      { $project: { topic: '$_id', count: 1, _id: 0 } },
      { $sort: { topic: 1 } },
    ]);

    const totalQuestions = topicsAgg.reduce((sum: number, t: any) => sum + t.count, 0);

    res.status(200).json({
      status: 'success',
      data: {
        topics: topicsAgg,
        totalQuestions,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * POST /api/questions/quiz
 * Generate a balanced, randomized quiz from selected topics.
 *
 * Body: { subject: string, topics: string[], count: number }
 *
 * Distribution algorithm:
 *   1. Divide count equally across topics.
 *   2. Distribute remainder (count % topics.length) to first N topics.
 *   3. If a topic has fewer questions than its quota, take all available
 *      and redistribute the deficit to remaining topics.
 *   4. Shuffle the combined result.
 */
export const generateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { subject, topics, count } = req.body;

    // --- Validation ---
    if (!subject || !SUBJECTS.includes(subject as Subject)) {
      res.status(400).json({
        status: 'error',
        message: `Invalid subject. Must be one of: ${SUBJECTS.join(', ')}`,
      });
      return;
    }

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      res.status(400).json({
        status: 'error',
        message: 'topics must be a non-empty array of topic strings',
      });
      return;
    }

    const requestedCount = parseInt(count, 10);
    if (isNaN(requestedCount) || requestedCount < 10) {
      res.status(400).json({
        status: 'error',
        message: 'count must be a number >= 10',
      });
      return;
    }

    // --- Check available questions per topic ---
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
      res.status(404).json({
        status: 'error',
        message: 'No questions found for the selected subject and topics',
      });
      return;
    }

    // Clamp to what's actually available
    const effectiveCount = Math.min(requestedCount, totalAvailable);

    // --- Distribute quota across topics ---
    // Only consider topics that actually have questions
    const activeTopics = topics.filter((t: string) => (availableMap[t] || 0) > 0);

    // Build initial quotas (equal split + remainder distribution)
    const perTopic = Math.floor(effectiveCount / activeTopics.length);
    let remainder = effectiveCount % activeTopics.length;

    const quotas: Record<string, number> = {};
    for (const t of activeTopics) {
      quotas[t] = perTopic + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
    }

    // Handle shortfalls: if a topic has fewer than its quota, redistribute
    let deficit = 0;
    for (const t of activeTopics) {
      const available = availableMap[t] || 0;
      if (quotas[t] > available) {
        deficit += quotas[t] - available;
        quotas[t] = available;
      }
    }

    // Redistribute deficit to topics that still have spare capacity
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

    // --- Fetch questions per topic using $sample for randomization ---
    const distribution: Record<string, number> = {};
    const allQuestions: any[] = [];

    for (const t of activeTopics) {
      const quota = quotas[t];
      if (quota <= 0) continue;

      const topicQuestions = await Question.aggregate([
        { $match: { subject: subject as string, topic: t } },
        { $sample: { size: quota } },
      ]);

      distribution[t] = topicQuestions.length;
      allQuestions.push(...topicQuestions);
    }

    // --- Shuffle the combined result (Fisher-Yates) ---
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    res.status(200).json({
      status: 'success',
      data: {
        questions: allQuestions,
        meta: {
          totalReturned: allQuestions.length,
          requested: requestedCount,
          distribution,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
