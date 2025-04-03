const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} = require('../controllers/departmentController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Create a department (Admin only)
router.post(
  '/',
  protect,
  requireRole(['institution_admin', 'college_admin']),
  createDepartment
);

// Get all departments (Protected)
router.get('/', protect, getDepartments);

// Get single department by ID (Protected)
router.get('/:id', protect, getDepartmentById);

// Update a department (Admin only)
router.put(
  '/:id',
  protect,
  requireRole(['institution_admin', 'college_admin']),
  updateDepartment
);

// Delete a department (Admin only - Soft delete recommended)
router.delete(
  '/:id',
  protect,
  requireRole(['institution_admin', 'college_admin']),
  deleteDepartment
);

module.exports = router;