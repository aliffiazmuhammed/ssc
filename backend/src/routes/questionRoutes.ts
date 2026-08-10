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
  getAttemptedStats,
  getBookmarks,
  getBookmarkIds,
  toggleBookmark,
  removeBookmark,
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

router.get('/attempted-stats', protect, getAttemptedStats);
router.get('/bookmarks', protect, getBookmarks);
router.get('/bookmark-ids', protect, getBookmarkIds);
router.post('/:id/bookmark', protect, toggleBookmark);
router.delete('/bookmarks/:id', protect, removeBookmark);

// Admin-only routes
router.post('/upload', protect, authorizeAdmin, upload.single('file'), uploadQuestions);
router.delete('/:id', protect, authorizeAdmin, deleteQuestion);

export default router;

