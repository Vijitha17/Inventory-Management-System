// controllers/departmentController.js
const asyncHandler = require('express-async-handler');
const { Department, College } = require('../models');
const { Op } = require('sequelize');

// @desc    Create a new department
// @route   POST /api/departments
// @access  Admin
const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, collegeId } = req.body;

  // Validate college exists
  const college = await College.findByPk(collegeId);
  if (!college) {
    res.status(400);
    throw new Error('College not found');
  }

  // Check for duplicate department code in the same college
  const existingDept = await Department.findOne({
    where: {
      [Op.and]: [
        { collegeId },
        { code }
      ]
    }
  });

  if (existingDept) {
    res.status(400);
    throw new Error('Department with this code already exists in the college');
  }

  const department = await Department.create({
    name,
    code,
    collegeId
  });

  res.status(201).json({
    success: true,
    data: department
  });
});

// @desc    Get all departments
// @route   GET /api/departments
// @access  Protected
const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.findAll({
    include: {
      model: College,
      as: 'college',
      attributes: ['id', 'name']
    }
  });

  res.status(200).json({
    success: true,
    count: departments.length,
    data: departments
  });
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Protected
const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findByPk(req.params.id, {
    include: {
      model: College,
      as: 'college',
      attributes: ['id', 'name']
    }
  });

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  res.status(200).json({
    success: true,
    data: department
  });
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Admin
const updateDepartment = asyncHandler(async (req, res) => {
  const { name, code, collegeId } = req.body;
  const department = await Department.findByPk(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  // Validate college if changing collegeId
  if (collegeId && collegeId !== department.collegeId) {
    const college = await College.findByPk(collegeId);
    if (!college) {
      res.status(400);
      throw new Error('New college not found');
    }
  }

  // Update department
  await department.update({
    name: name || department.name,
    code: code || department.code,
    collegeId: collegeId || department.collegeId
  });

  res.status(200).json({
    success: true,
    data: department
  });
});

// @desc    Delete department (soft delete)
// @route   DELETE /api/departments/:id
// @access  Admin
const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByPk(req.params.id);

  if (!department) {
    res.status(404);
    throw new Error('Department not found');
  }

  // Soft delete (recommended)
  await department.destroy();

  res.status(200).json({
    success: true,
    message: 'Department deleted'
  });
});

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};