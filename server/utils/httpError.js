/**
 * Creates an Error that carries an HTTP status code.
 * Example: throw httpError(404, 'Product not found');
 */
function httpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

module.exports = httpError;
