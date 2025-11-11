// Plans Route
import express from 'express';
import { getAllPlans } from '../utils/mysql.js';

const router = express.Router();

/**
 * GET /api/plans
 * Get all active plans
 */
router.get('/', async (req, res) => {
  try {
    const plans = await getAllPlans();
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({
      error: 'Failed to fetch plans',
      message: error.message
    });
  }
});

export default router;


