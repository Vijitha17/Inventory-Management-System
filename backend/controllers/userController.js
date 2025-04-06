const asyncHandler = require("express-async-handler");
const { User, College, Department } = require("../models/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { Op } = require('sequelize');

// ======================
// 1. TOKEN GENERATION
// ======================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ======================
// 2. ROLE VALIDATION HELPERS
// ======================
function canCreateUser(creator, newUserRole) {
  const creationRules = {
    institution_admin: ['college_admin', 'institution_top', 'institution_staff'],
    college_admin: ['department_admin', 'college_top', 'college_staff'],
    department_admin: ['department_top', 'department_staff']
  };
  
  // Check if creator has permission to create this role
  if (!creator || !creationRules[creator.role]?.includes(newUserRole)) {
    return false;
  }
  
  return true;
}

// ======================
// 3. AUTHENTICATION (NEW WITH ROLES)
// ======================
const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role, collegeId, departmentId, collegeName, collegeCode } = req.body;
    const creator = req.user;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered"
      });
    }

    // Role validation
    if (role) {
      if (!creator) {
        return res.status(403).json({
          success: false,
          message: "Admin privileges required to assign roles"
        });
      }
      if (!canCreateUser(creator, role)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions for this role assignment"
        });
      }
    }

    // Handle College Creation if needed
    let finalCollegeId = collegeId || (creator ? creator.collegeId : null);
    
    if (role === 'college_admin' && !finalCollegeId) {
      if (!collegeName || !collegeCode) {
        return res.status(400).json({
          success: false,
          message: "collegeName and collegeCode are required when creating college_admin without collegeId"
        });
      }
      
      const newCollege = await College.create({
        name: collegeName,
        code: collegeCode
      });
      finalCollegeId = newCollege.id;
    }

    // Handle Department Creation if needed
    let finalDepartmentId = departmentId || (creator ? creator.departmentId : null);

    // Create user with hashed password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'department_staff',
      collegeId: finalCollegeId,
      departmentId: finalDepartmentId,
      createdBy: creator?.id || null
    });

    // Generate token
    const token = generateToken(user.id);

    // Set cookie
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      expires: new Date(Date.now() + 86400000),
      sameSite: "none",
      secure: true
    });

    // Success response (excluding password)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId,
      departmentId: user.departmentId,
      photo: user.photo,
      phone: user.phone,
      bio: user.bio,
      token
    };

    return res.status(201).json({
      success: true,
      data: userResponse
    });

  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
      ...(error.errors && { details: error.errors.map(e => e.message) })
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 1. Add input validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // 2. Find user WITH password field
  const user = await User.scope('withPassword').findOne({ 
    where: { email },
    attributes: ['id', 'name', 'email', 'role', 'password']  
  });

  // 3. Check if user exists
  if (!user) {
    return res.status(400).json({ 
      success: false, message: "User not found" 
    });
  }
  
  
  // 4. Compare passwords
  const passwordIsCorrect = await bcrypt.compare(password, user.password);
  
  if (!passwordIsCorrect) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid password credentials" 
    });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
    
  });

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 86400000),
    sameSite: "lax",
    secure: false
  });

  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    collegeId: user.collegeId,
    departmentId: user.departmentId,
    photo: user.photo,
    phone: user.phone,
    bio: user.bio,
    token
  });
});

const logout = asyncHandler(async (req, res) => {
  res.cookie("token", "", {
    path: "/",
    httpOnly: true,
    expires: new Date(0),
    sameSite: "none",
    secure: true
  });
  res.status(200).json({ message: "Logged out successfully" });
});

// ======================
// 4. PASSWORD MANAGEMENT (YOUR EXISTING CODE - START)
// ======================
const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  const { oldPassword, password } = req.body;

  if (!user) {
    res.status(400);
    throw new Error("User not found, please signup");
  }

  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("Please add old and new password");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters");
  }

  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
  if (!passwordIsCorrect) {
    res.status(400);
    throw new Error("Old password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();
  res.status(200).send("Password change successful");
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    res.status(404);
    throw new Error("User does not exist");
  }

  let token = await Token.findOne({ where: { userId: user.id } });
  if (token) {
    await token.destroy();
  }

  let resetToken = crypto.randomBytes(32).toString("hex") + user.id;
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  await Token.destroy({
    where: { userId: user.id, expiresAt: { [Op.lt]: Date.now() } }
  });

  await Token.create({
    userId: user.id,
    token: hashedToken,
    expiresAt: Date.now() + 30 * 60 * 1000 // 30 mins
  });

  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
  const message = `
    <h2>Hello ${user.name}</h2>
    <p>Please use the url below to reset your password</p>  
    <p>This reset link is valid for only 30minutes.</p>
    <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
    <p>Regards...</p>
    <p>Inventory Team</p>
  `;

  try {
    await sendEmail({
      subject: "Password Reset Request",
      message,
      send_to: user.email,
      sent_from: process.env.EMAIL_USER
    });
    res.status(200).json({ success: true, message: "Reset Email Sent" });
  } catch (error) {
    res.status(500);
    throw new Error("Email not sent, please try again");
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const userToken = await Token.findOne({
    where: { token: hashedToken, expiresAt: { [Op.gt]: Date.now() } }
  });

  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired Token");
  }

  const user = await User.findByPk(userToken.userId);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();
  res.status(200).json({
    message: "Password Reset Successful, Please Login",
  });
});
// ======================
// PASSWORD MANAGEMENT (YOUR EXISTING CODE - END)
// ======================

// ======================
// 5. USER PROFILE MANAGEMENT
// ======================
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    collegeId: user.collegeId,
    departmentId: user.departmentId,
    photo: user.photo,
    phone: user.phone,
    bio: user.bio
  });
});

const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.json(false);
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    res.json(!!verified);
  } catch {
    res.json(false);
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Prevent unauthorized role changes
  if (req.body.role && req.body.role !== user.role) {
    const creator = await User.findByPk(user.createdBy);
    if (!creator || !canCreateUser(creator, req.body.role)) {
      res.status(403);
      throw new Error("Cannot assign this role");
    }
    user.role = req.body.role;
  }

  // Update other fields
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  user.bio = req.body.bio || user.bio;
  user.photo = req.body.photo || user.photo;

  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ where: { email: req.body.email } });
    if (emailExists) {
      res.status(400);
      throw new Error("Email already in use");
    }
    user.email = req.body.email;
  }

  await user.save();
  res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    collegeId: user.collegeId,
    departmentId: user.departmentId,
    photo: user.photo,
    phone: user.phone,
    bio: user.bio
  });
});

const getInstitutionUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    where: { 
      // Filter conditions for institution users
    },
    attributes: { exclude: ['password'] }
  });
  res.status(200).json(users);
});

const getCollegeUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    where: { 
      collegeId: req.user.collegeId
    },
    attributes: { exclude: ['password'] }
  });
  res.status(200).json(users);
});

const getDepartmentUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    where: { 
      departmentId: req.user.departmentId
    },
    attributes: { exclude: ['password'] }
  });
  res.status(200).json(users);
});


module.exports = {
  registerUser,
  loginUser,
  logout,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
  getInstitutionUsers,
  getCollegeUsers,
  getDepartmentUsers
};