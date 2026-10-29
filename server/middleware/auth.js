const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

/**
 * protect: only lets the request through if it carries a valid token.
 * Expects the header:  Authorization: Bearer <token>
 * On success, the logged-in user is available as req.user.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw httpError(401, 'Not authorized, please log in');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw httpError(401, 'Session expired or invalid, please log in again');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw httpError(401, 'User no longer exists');
  }

  req.user = user;
  next();
});

/**
 * adminOnly: use after protect. Blocks anyone who is not an admin.
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return next(httpError(403, 'Admin access only'));
};

module.exports = { protect, adminOnly };
