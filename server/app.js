const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

// Which websites may call this API (comma-separated list in CLIENT_URL).
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean);

app.use(helmet()); // sensible security headers
app.use(
  cors({
    origin(origin, callback) {
      // Requests with no origin (Postman, curl, server-to-server) are allowed.
      // Other origins get no CORS headers, so the browser blocks them.
      return callback(null, !origin || allowedOrigins.includes(origin));
    },
  })
);
app.use(express.json({ limit: '100kb' })); // read JSON request bodies
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev')); // request log in the terminal

// Quick check that the API is running.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
