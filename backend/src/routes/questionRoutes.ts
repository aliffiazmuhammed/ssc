import { Router } from 'express';
import {
  uploadQuestions,
  getQuestions,
  getSubjects,
  getTopics,
  getSubTopics,
  getTopicsWithCount,
  generateQuiz,
  deleteQuestion,
  upload,
} from '../controllers/questionController';
import { protect, authorizeAdmin } from '../middlewares/authMiddleware';

const router = Router();

// Public-ish routes (still require authentication)
router.get('/subjects', protect, getSubjects);
router.get('/topics', protect, getTopics);
router.get('/topics-with-count', protect, getTopicsWithCount);
router.get('/subtopics', protect, getSubTopics);
router.post('/quiz', protect, generateQuiz);
router.get('/', protect, getQuestions);

// Admin-only routes
router.post('/upload', protect, authorizeAdmin, upload.single('file'), uploadQuestions);
router.delete('/:id', protect, authorizeAdmin, deleteQuestion);

export default router;

