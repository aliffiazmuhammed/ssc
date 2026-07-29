import express from 'express';
import { getAllUsers, toggleUserStatus } from '../controllers/userController';
import { protect, authorizeAdmin } from '../middlewares/authMiddleware';

const router = express.Router();

// Apply middleware to all routes in this file
router.use(protect);
router.use(authorizeAdmin);

router.route('/').get(getAllUsers);
router.route('/:id/toggle-status').patch(toggleUserStatus);

export default router;
