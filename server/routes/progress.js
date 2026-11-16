/**
 * @file progress.js
 * @description Routes for saving and retrieving user algorithm progress.
 * @module routes/progress
 */

const express = require('express');
const { getDatabase } = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/progress
 * Return all progress records for the authenticated user.
 */
router.get('/', authMiddleware, (req, res, next) => {
  try {
    const db = getDatabase();
    const rows = db.prepare(
      'SELECT algorithm_slug, completed_at, steps_explored FROM user_progress WHERE user_id = ?'
    ).all(req.user.id);

    res.json({ progress: rows });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/progress
 * Save or update progress for an algorithm.
 * Body: { algorithmSlug: string, stepsExplored: number }
 */
router.post('/', authMiddleware, (req, res, next) => {
  try {
    const { algorithmSlug, stepsExplored } = req.body;

    if (!algorithmSlug || typeof algorithmSlug !== 'string') {
      return res.status(400).json({ error: 'algorithmSlug is required' });
    }

    const db = getDatabase();
    db.prepare(`
      INSERT INTO user_progress (user_id, algorithm_slug, steps_explored)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id, algorithm_slug)
      DO UPDATE SET steps_explored = excluded.steps_explored, completed_at = CURRENT_TIMESTAMP
    `).run(req.user.id, algorithmSlug, stepsExplored || 0);

    res.json({ message: 'Progress saved' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
