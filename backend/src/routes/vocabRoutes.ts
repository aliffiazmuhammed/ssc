import { Router } from 'express';
import multer from 'multer';
import { protect, authorizeAdmin } from '../middlewares/authMiddleware';
import { uploadVocab, getWords, getWordById, toggleStudy, getProgress, getDailyWords, generateQuiz, submitQuiz, getQuizHistory } from '../controllers/vocabController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect);

router.post('/upload', authorizeAdmin, upload.single('file'), uploadVocab);
router.get('/words', getWords);
router.get('/words/:id', getWordById);
router.post('/words/:id/study', toggleStudy);
router.get('/progress', getProgress);
router.get('/daily-words', getDailyWords);
router.post('/quiz/generate', generateQuiz);
router.post('/quiz/submit', submitQuiz);
router.get('/quiz/history', getQuizHistory);

export default router;
