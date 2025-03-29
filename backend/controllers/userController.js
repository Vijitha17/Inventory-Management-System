const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Token = require("../models/tokenModel");
const sendEmail = require("../utils/sendEmail");
const { Op } = require('sequelize');

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};
  
//Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    


    //validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields");
    }
    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be up to 6 characters");
    }
    // Check if user email already exists
    const userExists = await User.findOne({ where: { email } });

    if (userExists) {
        res.status(400);
        throw new Error("Email has already been registered");
    }



    // Create new user
    const user = await User.create({
        name,
        email,
        password,
    });

    //   Generate Token
    const token = generateToken(user.id);
     
 
    // Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        secure: true,
    });

    if (user) {
        const { id, name, email, photo, phone, bio } = user;
        res.status(201).json({
          id, 
          name, 
          email, 
          photo, 
          phone, 
          bio,
          token,
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
      }
});
   


// Login User
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    

     // Validate Request
    if (!email || !password) {
        res.status(400);
        throw new Error("Please add email and password");
    }


    // Check if user exists
    const user = await User.findOne({ where: { email } });

    if (!user) {
        res.status(400);
        throw new Error("User not found, please signup");
    }

    // User exists, check if password is correct
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    

    //   Generate Token
    const token = generateToken(user.id);
  
    if(passwordIsCorrect){
    // Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        secure: true,
    });
    }
    if (user && passwordIsCorrect) {
        const { id, name, email, photo, phone, bio } = user;
        res.status(200).json({
          id,
          name,
          email,
          photo,
          phone,
          bio,
          token,
        });
      } else {
        res.status(400);
        throw new Error("Invalid email or password");
      }

});

// Logout User
const logout = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true,
    });
    return res.status(200).json({ message: "Successfully Logged Out" });
});


// Get User Data

const getUser = asyncHandler (async (req, res) => {
    const user = await User.findByPk(req.user.id);

    if (user) {
      const { id, name, email, photo, phone, bio } = user;
      res.status(200).json({
        id,
        name,
        email,
        photo,
        phone,
        bio,
      });
    } else {
      res.status(400);
      throw new Error("User Not Found");
    }

});

// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
      return res.json(false);
    }
    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
      return res.json(true);
    }
    return res.json(false);
  });

// Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    const { name, email, photo, phone, bio } = user;
    
    // Email uniqueness check
    if (req.body.email && req.body.email !== email) {
      const emailExists = await User.findOne({ 
        where: { email: req.body.email } 
      });
      if (emailExists) {
        res.status(400);
        throw new Error("Email already in use");
      }
      user.email = req.body.email;
    }

    // Update other fields
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    // Wrap save operation in try/catch
    try {
      const updatedUser = await user.save();
      res.status(200).json({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        photo: updatedUser.photo,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
      });
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }

  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
  
//Change Password
const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id);
    const { oldPassword, password } = req.body;
  
    if (!user) {
      res.status(400);
      throw new Error("User not found, please signup");
    }
    //Validate
    if (!oldPassword || !password) {
      res.status(400);
      throw new Error("Please add old and new password");
    }
    

    // Add password length check HERE ⬇️
    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    // check if old password matches password in DB
    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
    

    // Save new password
    if (user && passwordIsCorrect) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      res.status(200).send("Password change successful");
    } else {
      res.status(400);
      throw new Error("Old password is incorrect");
    }
  });

//forgot password
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
  
    if (!user) {
      res.status(404);
      throw new Error("User does not exist");
    }
  
    // Delete token if it exists in DB
    let token = await Token.findOne({ where: { userId: user.id } });
    if (token) {
      await token.destroy();
    }
  
    // Create Reste Token
    let resetToken = crypto.randomBytes(32).toString("hex") + user.id;
    console.log(resetToken);
  
    // Hash token before saving to DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    // Save Token to DB
    await Token.destroy({
      where: {
        userId: user.id,
        expiresAt: { [Op.lt]: Date.now() }
      }
    });

    await Token.create({
      userId: user.id,
      token: hashedToken,
      expiresAt: Date.now() + 30 * 60 * 1000
    });
  
    // Construct Reset Url
    const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;
  
    // Reset Email
    const message = `
        <h2>Hello ${user.name}</h2>
        <p>Please use the url below to reset your password</p>  
        <p>This reset link is valid for only 30minutes.</p>
  
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  
        <p>Regards...</p>
        <p>Pinvent Team</p>
      `;
    const subject = "Password Reset Request";
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
  
    try {
      await sendEmail(subject, message, send_to, sent_from);
      res.status(200).json({ success: true, message: "Reset Email Sent" });
    } catch (error) {
      res.status(500);
      throw new Error("Email not sent, please try again");
    }
  });

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { resetToken } = req.params;
  
    // Hash token, then compare to Token in DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    // fIND tOKEN in DB
    const userToken = await Token.findOne({
      where: { 
        token: hashedToken,
        expiresAt: { [Op.gt]: Date.now() }
      }
    });
  
    if (!userToken) {
      res.status(404);
      throw new Error("Invalid or Expired Token");
    }
  
    // Find user
    const user = await User.findByPk(userToken.userId);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt); // ✅ Hashed
    await user.save();
    res.status(200).json({
      message: "Password Reset Successful, Please Login",
    });
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

    
};