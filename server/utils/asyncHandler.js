/**
 * Wraps an async route handler so any thrown error or rejected promise
 * is passed to Express's error handler instead of crashing the server.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
