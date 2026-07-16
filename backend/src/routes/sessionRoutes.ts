import { Router } from 'express';
import {
  startSession,
  recordAnswer,
  completeSession,
  listSessions,
  getSessionDetail,
} from '../controllers/sessionController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// All session routes require authentication
router.use(protect);

router.post('/start', startSession);
router.post('/:id/answer', recordAnswer);
router.post('/:id/complete', completeSession);
router.get('/', listSessions);
router.get('/:id', getSessionDetail);

export default router;
