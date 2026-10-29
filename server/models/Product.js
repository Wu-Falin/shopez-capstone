const mongoose = require('mongoose');
const { CATEGORIES } = require('../config/constants');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: { values: CATEGORIES, message: 'Unknown category: {VALUE}' },
    },
    image: {
      type: String,
      default: '/images/products/placeholder.svg',
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
  },
  { timestamps: true }
);

// Indexes that speed up name search and category filters.
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
