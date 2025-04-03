// routes/collegeRoute.js
const express = require('express');
const router = express.Router();
const {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege
} = require('../controllers/collegeController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Create a college (Institution Admin only)
router.post(
  '/',
  protect,
  requireRole(['institution_admin']),
  createCollege
);

// Get all colleges (Protected)
router.get('/', protect, getColleges);

// Get single college by ID (Protected)
router.get('/:id', protect, getCollegeById);

// Update a college (Institution Admin only)
router.put(
  '/:id',
  protect,
  requireRole(['institution_admin']),
  updateCollege
);

// Delete a college (Institution Admin only - Soft delete recommended)
router.delete(
  '/:id',
  protect,
  requireRole(['institution_admin']),
  deleteCollege
);

module.exports = router;