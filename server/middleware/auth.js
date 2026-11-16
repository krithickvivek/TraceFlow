/**
 * @file auth.js
 * @description JWT verification middleware. Extracts token from httpOnly cookie,
 *              verifies it, and attaches user data to req.user.
 * @module middleware/auth
 */

const jwt = require('jsonwebtoken');

/** Name of the httpOnly cookie storing the JWT. */
const COOKIE_NAME = 'traceflow_token';

/**
 * Express middleware that verifies JWT from cookies.
 * If valid, sets req.user = { id, email }. Otherwise returns 401.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function authMiddleware(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware, COOKIE_NAME };
