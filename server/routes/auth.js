/**
 * @file auth.js
 * @description Authentication routes: register, login, logout, and session check.
 * @module routes/auth
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDatabase } = require('../db/database');
const { authMiddleware, COOKIE_NAME } = require('../middleware/auth');

const router = express.Router();

/** Number of bcrypt salt rounds. */
const SALT_ROUNDS = 12;

/** JWT expiry duration. */
const JWT_EXPIRY = '24h';

/** Cookie options for httpOnly JWT cookie. */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/'
};

/**
 * Generate a JWT for a given user.
 *
 * @param {{ id: number, email: string }} user
 * @returns {string} Signed JWT string.
 */
function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRY
  });
}

/**
 * POST /api/auth/register
 * Create a new user account.
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, organization, experience_level, bio } = req.body;

    /* Validation */
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = getDatabase();

    /* Check for existing user. */
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    /* Hash password and insert. */
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, role, organization, experience_level, bio) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(name.trim(), email.toLowerCase(), passwordHash, role || '', organization || '', experience_level || '', bio || '');

    const user = {
      id: result.lastInsertRowid,
      name: name.trim(),
      email: email.toLowerCase(),
      role: role || '',
      organization: organization || '',
      experience_level: experience_level || '',
      bio: bio || '',
      profile_pic: ''
    };
    const token = generateToken(user);

    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Authenticate an existing user.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role || '', organization: user.organization || '', experience_level: user.experience_level || '', bio: user.bio || '', profile_pic: user.profile_pic || '', created_at: user.created_at } });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 * Clear the auth cookie.
 */
router.post('/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ message: 'Logged out' });
});

/**
 * GET /api/auth/me
 * Return the currently authenticated user.
 */
router.get('/me', authMiddleware, (req, res) => {
  const db = getDatabase();
  const user = db.prepare('SELECT id, name, email, role, organization, experience_level, bio, profile_pic, created_at FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile fields.
 */
router.put('/profile', authMiddleware, (req, res) => {
  const { name, role, organization, experience_level, bio, profile_pic } = req.body;
  const db = getDatabase();

  db.prepare(`
    UPDATE users SET name = ?, role = ?, organization = ?, experience_level = ?, bio = ?, profile_pic = ?
    WHERE id = ?
  `).run(
    name || '', role || '', organization || '', experience_level || '', bio || '', profile_pic || '',
    req.user.id
  );

  const user = db.prepare('SELECT id, name, email, role, organization, experience_level, bio, profile_pic, created_at FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

// GET /api/auth/saved - get all saved visualizations for logged-in user
router.get('/saved', authMiddleware, (req, res) => {
  const db = getDatabase();
  const rows = db.prepare(
    'SELECT * FROM saved_visualizations WHERE user_id = ? ORDER BY saved_at DESC'
  ).all(req.user.id);
  res.json({ saved: rows });
});

// POST /api/auth/saved - save a visualization
router.post('/saved', authMiddleware, (req, res) => {
  const { algorithm_slug, algorithm_name, category, input_data, total_steps, notes, speed_ms, difficulty } = req.body;
  if (!algorithm_slug || !algorithm_name) {
    return res.status(400).json({ error: 'Algorithm slug and name are required.' });
  }
  const db = getDatabase();
  const result = db.prepare(
    'INSERT INTO saved_visualizations (user_id, algorithm_slug, algorithm_name, category, input_data, total_steps, notes, speed_ms, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, algorithm_slug, algorithm_name, category || '', input_data || '', total_steps || 0, notes || '', speed_ms || 0, difficulty || '');
  res.json({ id: result.lastInsertRowid, message: 'Visualization saved!' });
});

// PUT /api/auth/saved/:id - update notes on a saved visualization
router.put('/saved/:id', authMiddleware, (req, res) => {
  const db = getDatabase();
  const row = db.prepare('SELECT id FROM saved_visualizations WHERE user_id = ? AND id = ?').get(req.user.id, req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found.' });
  const { notes } = req.body;
  db.prepare('UPDATE saved_visualizations SET notes = ? WHERE id = ?').run(notes || '', req.params.id);
  res.json({ message: 'Updated.' });
});

// DELETE /api/auth/saved/:id - delete a saved visualization
router.delete('/saved/:id', authMiddleware, (req, res) => {
  const db = getDatabase();
  const row = db.prepare('SELECT id FROM saved_visualizations WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: 'Not found.' });
  db.prepare('DELETE FROM saved_visualizations WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted.' });
});

// ─── Quiz Score Endpoints ───

// POST /api/auth/quiz - save a quiz score
router.post('/quiz', authMiddleware, (req, res) => {
  const { algorithm_slug, algorithm_name, score, total, answers } = req.body;
  if (!algorithm_slug || !algorithm_name || score === undefined || !total) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  const db = getDatabase();
  const result = db.prepare(
    'INSERT INTO quiz_scores (user_id, algorithm_slug, algorithm_name, score, total, answers) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, algorithm_slug, algorithm_name, score, total, JSON.stringify(answers || []));
  res.json({ id: result.lastInsertRowid, message: 'Quiz score saved!' });
});

// GET /api/auth/quiz - get all quiz scores for user
router.get('/quiz', authMiddleware, (req, res) => {
  const db = getDatabase();
  const scores = db.prepare(
    'SELECT * FROM quiz_scores WHERE user_id = ? ORDER BY taken_at DESC'
  ).all(req.user.id);
  res.json({ scores });
});

// GET /api/auth/quiz/:slug - get quiz scores for a specific algorithm
router.get('/quiz/:slug', authMiddleware, (req, res) => {
  const db = getDatabase();
  const scores = db.prepare(
    'SELECT * FROM quiz_scores WHERE user_id = ? AND algorithm_slug = ? ORDER BY taken_at DESC'
  ).all(req.user.id, req.params.slug);
  res.json({ scores });
});

// GET /api/auth/quiz-stats - get aggregated quiz stats for profile
router.get('/quiz-stats', authMiddleware, (req, res) => {
  const db = getDatabase();
  const stats = db.prepare(`
    SELECT algorithm_slug, algorithm_name,
           MAX(score) as best_score, total,
           COUNT(*) as attempts,
           MAX(taken_at) as last_attempt
    FROM quiz_scores WHERE user_id = ?
    GROUP BY algorithm_slug
    ORDER BY last_attempt DESC
  `).all(req.user.id);

  const totalQuizzes = stats.length;
  const totalAttempts = stats.reduce((sum, s) => sum + s.attempts, 0);
  const perfectScores = stats.filter(s => s.best_score === s.total).length;

  res.json({ stats, totalQuizzes, totalAttempts, perfectScores });
});

// DELETE /api/auth/quiz/:slug - delete all quiz scores for a specific algorithm
router.delete('/quiz/:slug', authMiddleware, (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM quiz_scores WHERE user_id = ? AND algorithm_slug = ?').run(req.user.id, req.params.slug);
  res.json({ message: 'Deleted.', deleted: result.changes });
});

// DELETE /api/auth/quiz - delete ALL quiz scores for the user
router.delete('/quiz', authMiddleware, (req, res) => {
  const db = getDatabase();
  const result = db.prepare('DELETE FROM quiz_scores WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'All quiz history deleted.', deleted: result.changes });
});

module.exports = router;
