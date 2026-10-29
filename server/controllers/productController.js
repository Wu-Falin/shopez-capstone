const Product = require('../models/Product');
const { CATEGORIES } = require('../config/constants');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

// Fields an admin is allowed to set on a product.
const EDITABLE_FIELDS = ['name', 'description', 'price', 'category', 'image', 'stock'];

const SORT_OPTIONS = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  name: { name: 1 },
};

// Escapes special characters so user text is searched literally (prevents regex injection).
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Copies only the allowed fields from the request body.
function pickEditable(body) {
  const data = {};
  EDITABLE_FIELDS.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });
  return data;
}

/**
 * GET /api/products?search=&category=&sort=
 * Public. Lists products, with optional name search, category filter and sort.
 */
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, sort } = req.query;
  const filter = {};

  if (typeof search === 'string' && search.trim()) {
    filter.name = { $regex: escapeRegex(search.trim().slice(0, 50)), $options: 'i' };
  }
  if (typeof category === 'string' && category && category !== 'All') {
    filter.category = category;
  }

  const sortBy = SORT_OPTIONS[sort] || SORT_OPTIONS.newest;
  const products = await Product.find(filter).sort(sortBy);
  res.json(products);
});

/**
 * GET /api/products/categories
 * Public. Returns the list of allowed categories.
 */
const getCategories = (req, res) => {
  res.json(CATEGORIES);
};

/**
 * GET /api/products/:id
 * Public. One product.
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, 'Product not found');
  res.json(product);
});

/**
 * POST /api/products   (admin)
 * Body: { name, description, price, category, image, stock }
 */
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(pickEditable(req.body));
  res.status(201).json(product);
});

/**
 * PUT /api/products/:id   (admin)
 * Body: any of { name, description, price, category, image, stock }
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, 'Product not found');

  Object.assign(product, pickEditable(req.body));
  const saved = await product.save(); // save() runs the schema validators
  res.json(saved);
});

/**
 * DELETE /api/products/:id   (admin)
 * Past orders keep their own copy of the product, so they are not affected.
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, 'Product not found');

  await product.deleteOne();
  res.json({ message: 'Product deleted', _id: product._id });
});

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
