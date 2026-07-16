import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import QuizSession from '../models/QuizSession';
import QuestionAttempt from '../models/QuestionAttempt';

/**
 * GET /api/analytics/overview
 * Returns global stats and a time-series trend of scores.
 */
export const getOverviewAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const { subject } = req.query;
    const query: any = { userId, status: 'completed' };
    if (subject && subject !== 'All Subjects') {
      query.subject = subject;
    }

    // Time-series trend: score of the last N completed quizzes
    const trendSessions = await QuizSession.find(query)
      .sort({ completedAt: 1 })
      .select('completedAt results.score subject');

    const trendData = trendSessions.map(session => ({
      date: session.completedAt,
      score: session.results.score,
      subject: session.subject,
    }));

    res.status(200).json({
      status: 'success',
      data: {
        trend: trendData,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/analytics/subjects
 * Returns accuracy broken down by subject.
 */
export const getSubjectAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const subjectAgg = await QuestionAttempt.aggregate([
      { $match: { userId, selectedOption: { $ne: null } } },
      {
        $lookup: {
          from: 'quizsessions',
          localField: 'sessionId',
          foreignField: '_id',
          as: 'session'
        }
      },
      { $unwind: '$session' },
      { $match: { 'session.status': 'completed' } },
      { 
        $group: {
          _id: '$subject',
          totalAttempts: { $sum: 1 },
          correctCount: { 
            $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } 
          }
        }
      },
      {
        $project: {
          subject: '$_id',
          _id: 0,
          totalAttempts: 1,
          correctCount: 1,
          accuracy: {
            $round: [{ $multiply: [{ $divide: ['$correctCount', '$totalAttempts'] }, 100] }, 0]
          }
        }
      },
      { $sort: { accuracy: -1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        subjects: subjectAgg,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * GET /api/analytics/topics
 * Returns accuracy broken down by topic to identify weaknesses.
 */
export const getTopicAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const { subject } = req.query;
    const matchStage: any = { userId, selectedOption: { $ne: null } };
    if (subject && subject !== 'All Subjects') {
      matchStage.subject = subject;
    }

    const topicAgg = await QuestionAttempt.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'quizsessions',
          localField: 'sessionId',
          foreignField: '_id',
          as: 'session'
        }
      },
      { $unwind: '$session' },
      { $match: { 'session.status': 'completed' } },
      {
        $group: {
          _id: '$topic',
          subject: { $first: '$subject' },
          totalAttempts: { $sum: 1 },
          correctCount: { 
            $sum: { $cond: [{ $eq: ['$isCorrect', true] }, 1, 0] } 
          }
        }
      },
      {
        $project: {
          topic: '$_id',
          subject: 1,
          _id: 0,
          totalAttempts: 1,
          correctCount: 1,
          accuracy: {
            $round: [{ $multiply: [{ $divide: ['$correctCount', '$totalAttempts'] }, 100] }, 0]
          }
        }
      },
      { $sort: { accuracy: 1 } }, // Sort ascending to easily get weakest topics
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        topics: topicAgg,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
