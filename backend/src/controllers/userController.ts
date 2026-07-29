import { Response } from 'express';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';

/**
 * @desc    Get all users with pagination and sorting
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortStr = (req.query.sort as string) || 'latest';
    
    // Calculate skip
    const skip = (page - 1) * limit;

    // Determine sorting
    let sortObj: any = { createdAt: -1 };
    if (sortStr === 'oldest') {
      sortObj = { createdAt: 1 };
    } else if (sortStr === 'name') {
      sortObj = { name: 1 };
    }
    
    const filter = {};

    const users = await User.find(filter)
      .select('-password')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * @desc    Toggle user active status
 * @route   PATCH /api/users/:id/toggle-status
 * @access  Private/Admin
 */
export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    
    // Prevent admin from deactivating themselves
    if (user._id.toString() === req.user?._id.toString()) {
      res.status(400).json({ status: 'error', message: 'You cannot deactivate your own account' });
      return;
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        isActive: user.isActive,
      },
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
