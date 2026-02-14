const authService = require("../services/authService");

// Send OTP for signup verification
exports.sendotp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    await authService.sendOtp(email);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    return res.status(409).json({
      success: false,
      message: error.message || "Something went wrong while sending otp",
    });
  }
};

// Signup new user
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, middleName, email, password, confirmPassword, otp } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const user = await authService.signup({
      firstName,
      lastName,
      middleName,
      email,
      password,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "User registered successfully. Your role will be determined by your actions.",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error in signup. Please try again.",
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const { user, token } = await authService.login(email, password);

    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.cookie("token", token, options).status(200).json({
      success: true,
      token,
      user,
      message: "User logged in successfully",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Login failed. Please try again.",
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    await authService.changePassword(req.user.id, oldPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Error changing password. Please try again.",
    });
  }
};

// Request password reset token
exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    await authService.requestPasswordReset(email);

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Error sending reset link. Please try again.",
    });
  }
};

// Reset password using token
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    await authService.resetPassword(token, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error resetting password. Please try again.",
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(Date.now()),
      httpOnly: true,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

// Request account removal
exports.requestAccountRemoval = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reason for account removal is required",
      });
    }

    const RemovalRequest = require("../models/RemovalRequest");

    const existing = await RemovalRequest.findOne({
      user: req.user.id,
      status: "Pending",
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending removal request",
      });
    }

    await RemovalRequest.create({
      user: req.user.id,
      reason: reason.trim(),
    });

    return res.status(200).json({
      success: true,
      message: "Account removal request submitted. Admin will review it.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error submitting removal request",
    });
  }
};
