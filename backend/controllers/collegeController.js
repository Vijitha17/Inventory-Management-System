// controllers/collegeController.js
const asyncHandler = require('express-async-handler');
const { College } = require('../models');

// @desc    Create a new college
// @route   POST /api/colleges
// @access  Institution Admin
const createCollege = asyncHandler(async (req, res) => {
  const { name, code } = req.body;

  if (!name || !code) {
    res.status(400);
    throw new Error('College name and code are required');
  }

  const collegeExists = await College.findOne({ where: { code } });
  if (collegeExists) {
    res.status(400);
    throw new Error('College with this code already exists');
  }

  const college = await College.create({ name, code });
  res.status(201).json({ success: true, data: college });
});

// @desc    Get all colleges
// @route   GET /api/colleges
// @access  Protected
const getColleges = asyncHandler(async (req, res) => {
  const colleges = await College.findAll();
  res.status(200).json({ success: true, count: colleges.length, data: colleges });
});

// @desc    Get single college
// @route   GET /api/colleges/:id
// @access  Protected
const getCollegeById = asyncHandler(async (req, res) => {
  const college = await College.findByPk(req.params.id);

  if (!college) {
    res.status(404);
    throw new Error('College not found');
  }

  res.status(200).json({ success: true, data: college });
});

// @desc    Update college
// @route   PUT /api/colleges/:id
// @access  Institution Admin
const updateCollege = asyncHandler(async (req, res) => {
  const college = await College.findByPk(req.params.id);

  if (!college) {
    res.status(404);
    throw new Error('College not found');
  }

  const { name, code } = req.body;

  // Check for duplicate code (if code is being updated)
  if (code && code !== college.code) {
    const codeExists = await College.findOne({ where: { code } });
    if (codeExists) {
      res.status(400);
      throw new Error('College with this code already exists');
    }
  }

  await college.update({
    name: name || college.name,
    code: code || college.code
  });

  res.status(200).json({ success: true, data: college });
});

// @desc    Delete college (soft delete)
// @route   DELETE /api/colleges/:id
// @access  Institution Admin
const deleteCollege = asyncHandler(async (req, res) => {
  const college = await College.findByPk(req.params.id);

  if (!college) {
    res.status(404);
    throw new Error('College not found');
  }

  await college.destroy();
  res.status(200).json({ success: true, message: 'College deleted' });
});

module.exports = {
  createCollege,
  getColleges,
  getCollegeById,
  updateCollege,
  deleteCollege
};