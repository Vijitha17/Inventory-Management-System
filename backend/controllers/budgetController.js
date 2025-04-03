const asyncHandler = require("express-async-handler");
const { BudgetRequest } = require("../models");
const { requireRole } = require("../middleware/roleMiddleware");

// Institution Admin submits budget request
const submitBudgetRequest = asyncHandler(async (req, res) => {
  if (req.user.role !== 'institution_admin') {
    res.status(403);
    throw new Error("Only institution admins can submit budget requests");
  }

  const { amount, purpose, items } = req.body;

  const request = await BudgetRequest.create({
    amount,
    purpose,
    items: JSON.stringify(items),
    status: 'pending',
    requestedBy: req.user.id
  });

  res.status(201).json(request);
});

// Institution Top-Level approves budget
const approveBudget = asyncHandler(async (req, res) => {
  if (req.user.role !== 'institution_top') {
    res.status(403);
    throw new Error("Only institution top-level can approve budgets");
  }

  const { requestId } = req.params;
  const request = await BudgetRequest.findByPk(requestId);

  if (!request) {
    res.status(404);
    throw new Error("Budget request not found");
  }

  request.status = 'approved';
  request.approvedBy = req.user.id;
  request.approvedAt = new Date();
  await request.save();

  res.json(request);
});

module.exports = {
  submitBudgetRequest,
  approveBudget
};