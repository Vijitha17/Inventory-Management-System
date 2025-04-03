const express = require("express");
const router = express.Router();
const { 
  registerUser,
  loginUser,
  logout,
  getUser,
  updateUser,
  changePassword,
  getInstitutionUsers,    
  getCollegeUsers,      
  getDepartmentUsers 
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const { requireRole, requireScope } = require("../middleware/roleMiddleware");

// Public routes
router.post("/login", loginUser);

// Protected routes
router.use(protect);

router.post("/logout", logout);
router.get("/me", getUser);
router.put("/me", updateUser);
router.patch("/password", changePassword);

// Admin-only routes
router.post("/registerusers", 
  protect,
  requireRole(['institution_admin', 'college_admin', 'department_admin']), 
  registerUser
);

// Institution admin only
router.get("/institution/getusers", 
  requireRole(['institution_admin']), 
  requireScope('institution'),
  getInstitutionUsers
);

// College admin only
router.get("/college/getusers", 
  requireRole(['college_admin']), 
  requireScope('college'),
  getCollegeUsers
);

// Department admin only
router.get("/department/getusers", 
  requireRole(['department_admin']), 
  requireScope('department'),
  getDepartmentUsers
);

module.exports = router;
