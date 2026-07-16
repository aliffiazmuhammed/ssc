import { Router } from 'express';
import {
  getOverviewAnalytics,
  getSubjectAnalytics,
  getTopicAnalytics,
} from '../controllers/analyticsController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

// All analytics routes require authentication
router.use(protect);

router.get('/overview', getOverviewAnalytics);
router.get('/subjects', getSubjectAnalytics);
router.get('/topics', getTopicAnalytics);

export default router;
