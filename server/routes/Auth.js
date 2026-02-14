const express = require("express");
const router = express.Router();
const {
  sendotp,
  signup,
  login,
  changePassword,
  resetPasswordToken,
  resetPassword,
  logout,
  requestAccountRemoval,
} = require("../controllers/Auth");
const { auth } = require("../middlewares/auth");

// Public routes
router.post("/send-otp", sendotp);
router.post("/signup", signup);
router.post("/login", login);
router.post("/reset-password-token", resetPasswordToken);
router.post("/reset-password", resetPassword);

// Protected routes
router.put("/change-password", auth, changePassword);
router.post("/logout", auth, logout);
router.post("/request-removal", auth, requestAccountRemoval);

module.exports = router;
