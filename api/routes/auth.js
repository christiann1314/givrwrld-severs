// Authentication Routes
import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { generateToken, generateRefreshToken } from '../utils/jwt.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Create new user account
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // Check if user exists
    const [existing] = await pool.execute(
      `SELECT id FROM users WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    const displayName = firstName && lastName 
      ? `${firstName} ${lastName}`.trim()
      : email.split('@')[0];

    await pool.execute(
      `INSERT INTO users (id, email, password_hash, display_name, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, email.toLowerCase().trim(), passwordHash, displayName]
    );

    // Generate tokens
    const token = generateToken({ userId, email: email.toLowerCase().trim() });
    const refreshToken = generateRefreshToken({ userId });

    res.status(201).json({
      success: true,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        display_name: displayName
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Signup failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required'
      });
    }

    // Find user
    const [users] = await pool.execute(
      `SELECT id, email, password_hash, display_name FROM users WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    const user = users[0];

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate tokens
    const token = generateToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const [users] = await pool.execute(
      `SELECT id, email, display_name, is_email_verified, created_at FROM users WHERE id = ?`,
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout (client should remove token)
 */
router.post('/logout', authenticate, (req, res) => {
  // In a stateless JWT system, logout is handled client-side
  // You could implement token blacklisting here if needed
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required'
      });
    }

    // Verify refresh token
    const { verifyToken } = await import('../utils/jwt.js');
    const decoded = verifyToken(refreshToken);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: 'Invalid refresh token'
      });
    }

    // Generate new access token
    const token = generateToken({ userId: decoded.userId, email: decoded.email });

    res.json({
      success: true,
      token
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      message: error.message
    });
  }
});

export default router;


