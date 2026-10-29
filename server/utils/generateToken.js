const jwt = require('jsonwebtoken');

/**
 * Creates a signed JWT that identifies the user.
 * The token only stores the user id; the role is always read fresh from the database.
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;
