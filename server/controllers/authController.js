const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const generateToken = require('../utils/generateToken');

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 * Creates a customer account and returns a login token.
 */
const register = asyncHandler(async (req, res) => {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!name || !email || !password) {
    throw httpError(400, 'Name, email and password are required');
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw httpError(400, 'Please enter a valid email');
  }
  if (password.length < 6) {
    throw httpError(400, 'Password must be at least 6 characters');
  }

  const exists = await User.findOne({ email });
  if (exists) {
    throw httpError(400, 'This email is already registered');
  }

  // The role is never taken from the request: new accounts are always customers.
  const user = await User.create({ name, email, password, role: 'customer' });

  res.status(201).json({
    token: generateToken(user._id),
    user: user.toPublicJSON(),
  });
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = asyncHandler(async (req, res) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!email || !password) {
    throw httpError(400, 'Email and password are required');
  }

  // The password field is hidden by default, so ask for it explicitly.
  const user = await User.findOne({ email }).select('+password');
  const valid = user && (await user.matchPassword(password));

  // Same message for "no such user" and "wrong password", so emails can't be guessed.
  if (!valid) {
    throw httpError(401, 'Invalid email or password');
  }

  res.json({
    token: generateToken(user._id),
    user: user.toPublicJSON(),
  });
});

/**
 * GET /api/auth/me   (logged in)
 * Returns the current user. The client uses it to check a saved token.
 */
const getMe = asyncHandler(async (req, res) => {
  res.json(req.user.toPublicJSON());
});

module.exports = { register, login, getMe };
