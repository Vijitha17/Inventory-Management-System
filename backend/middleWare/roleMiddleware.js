const asyncHandler = require("express-async-handler");
const { User } = require("../models");

// Middleware to check if user has required role
const requireRole = (requiredRoles) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      res.status(401);
      throw new Error("Not authorized");
    }

    if (!requiredRoles.includes(user.role)) {
      res.status(403);
      throw new Error("Access denied. Insufficient permissions");
    }

    next();
  });
};

// Middleware to check scope (institution/college/department)
const requireScope = (scopeLevel) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;
    
    if (scopeLevel === 'institution' && user.adminLevel !== 'institution') {
      res.status(403);
      throw new Error("Institution-level access required");
    }

    if (scopeLevel === 'college' && !['institution', 'college'].includes(user.adminLevel)) {
      res.status(403);
      throw new Error("College-level access required");
    }

    if (scopeLevel === 'department' && user.adminLevel === 'none') {
      res.status(403);
      throw new Error("Department-level access required");
    }

    next();
  });
};

module.exports = { requireRole, requireScope };