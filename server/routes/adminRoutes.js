const express = require('express');
const { getStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, adminOnly, getStats);

module.exports = router;
