require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

// Connect to the database first, then start listening for requests.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ShopEZ API running on http://localhost:${PORT}`);
  });
});
