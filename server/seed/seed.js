/**
 * Fills the database with sample data:  npm run seed
 *
 * WARNING: this deletes all existing users, products and orders first.
 * It then creates 12 products, one admin account and one customer account.
 */
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const products = require('./products');

const DEMO_USERS = [
  { name: 'ShopEZ Admin', email: 'admin@shopez.com', password: 'Admin@123', role: 'admin' },
  { name: 'Demo Customer', email: 'customer@shopez.com', password: 'Customer@123', role: 'customer' },
];

async function seed() {
  await connectDB();

  await Promise.all([Order.deleteMany({}), Product.deleteMany({}), User.deleteMany({})]);
  console.log('Cleared users, products and orders');

  await Product.insertMany(products);
  console.log(`Added ${products.length} products`);

  // create() (not insertMany) so the password-hashing hook runs for each user.
  for (const user of DEMO_USERS) {
    await User.create(user);
  }
  console.log('Added demo accounts:');
  DEMO_USERS.forEach((u) => console.log(`  ${u.role.padEnd(8)}  ${u.email}  /  ${u.password}`));
}

seed()
  .then(() => mongoose.disconnect())
  .then(() => {
    console.log('Seeding finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  });
