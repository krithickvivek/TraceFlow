/**
 * @file index.js
 * @description Express server entry point for TraceFlow V2. Configures middleware,
 *              mounts API routes, initializes the database, and serves the static
 *              client build in production.
 * @module server
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initDatabase } = require('./db/database');
const { errorHandler } = require('./middleware/errorHandler');
const authRouter = require('./routes/auth');
const algorithmsRouter = require('./routes/algorithms');
const progressRouter = require('./routes/progress');

const app = express();

/** Port defaults to 4000 unless overridden by environment variable. */
const PORT = process.env.PORT || 4000;

/* ── Initialize database on startup ── */
initDatabase();

/* ── Middleware ── */

/* Enable CORS for development (Vite runs on a different port). */
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

/* Parse JSON bodies and cookies. */
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

/* ── API routes ── */
app.use('/api/auth', authRouter);
app.use('/api/algorithms', algorithmsRouter);
app.use('/api/progress', progressRouter);

/* ── Static file serving (production) ── */
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

/* Fallback: serve index.html for any non-API route (SPA client-side routing). */
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

/* ── Global error handler (must be last) ── */
app.use(errorHandler);

/* ── Start server (skipped when imported by the Vercel serverless wrapper) ── */
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TraceFlow server running on http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api/algorithms`);
    console.log(`Auth: http://localhost:${PORT}/api/auth`);
  });
}

module.exports = app;
