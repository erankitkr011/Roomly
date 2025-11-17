const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

// Middleware to verify JWT token
exports.auth = async (req, res, next) => {
  try {
    // Extract token from header or cookie
    const token =
      req.cookies?.token ||
      req.body?.token ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is missing",
      });
    }

    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode;
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something went wrong while validating the token",
    });
  }
};

// Middleware to check if user is Landlord
exports.isLandlord = async (req, res, next) => {
  try {
    const userDetails = await User.findById(req.user.id);
    
    // Check if user is Admin (admins have all permissions)
    if (userDetails.accountType === "Admin") {
      return next();
    }
    
    // Check if user has landlord role
    if (!userDetails.roles?.isLandlord) {
      return res.status(403).json({
        success: false,
        message: "This is a protected route for Landlords only. You need to add a house first to become a landlord.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};

// Middleware to check if user is Renter
exports.isRenter = async (req, res, next) => {
  try {
    const userDetails = await User.findById(req.user.id);
    
    // Check if user is Admin (admins have all permissions)
    if (userDetails.accountType === "Admin") {
      return next();
    }
    
    // Check if user has renter role
    if (!userDetails.roles?.isRenter) {
      return res.status(403).json({
        success: false,
        message: "This is a protected route for Renters only. You need to be allocated to a room first.",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};

// Middleware to check if user is Admin
exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findById(req.user.id);
    if (userDetails.accountType !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "This is a protected route for Admin only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified",
    });
  }
};

