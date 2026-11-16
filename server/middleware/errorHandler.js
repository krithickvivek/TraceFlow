/**
 * @file errorHandler.js
 * @description Global Express error handler. Catches unhandled errors
 *              and returns a consistent JSON error response.
 * @module middleware/errorHandler
 */

/**
 * Global error handling middleware.
 *
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  console.error('[ERROR]', err.message);

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({ error: message });
}

module.exports = { errorHandler };
