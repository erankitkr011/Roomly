const OTP = require("../models/Otp");
const User = require("../models/User");
const Profile = require("../models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { mailSender } = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
const { passwordResetTemplate } = require("../mail/templates/passwordResetTemplate");
require("dotenv").config();

/**
 * Generate unique OTP
 */
const generateOtp = async () => {
  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  const existingOtp = await OTP.findOne({ otp });
  if (existingOtp) {
    return await generateOtp();
  }
  return otp;
};

/**
 * Send OTP for signup
 */
exports.sendOtp = async (email) => {
  const isUserExist = await User.findOne({ email: email.toLowerCase() });
  if (isUserExist) {
    throw new Error("User with this email already exists");
  }

  const otp = await generateOtp();
  await OTP.create({ email: email.toLowerCase(), otp });
  return { success: true};
};

/**
 * Signup new user
 */
exports.signup = async (userData) => {
  const { firstName, lastName, middleName, email, password, otp } = userData;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const recentOtp = await OTP.find({ email: email.toLowerCase() }).sort({ createdAt: -1 }).limit(1);
  if (recentOtp.length === 0 || recentOtp[0].otp !== otp) {
    throw new Error("Invalid OTP");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const profile = await Profile.create({
    gender: "",
    dateOfBirth: "",
    about: "",
    contactNumber: "",
    aadharNo: "",
    aadharImage: "",
  });

  const image = `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`;

  // Check for pending renter invites
  const RenterInvite = require("../models/RenterInvite");
  const Room = require("../models/Room");
  const pendingInvite = await RenterInvite.findOne({
    email: email.toLowerCase(),
    status: "Pending",
    expiresAt: { $gt: new Date() },
  });

  const isRenter = !!pendingInvite;

  // Create user with dynamic roles
  const user = await User.create({
    firstName,
    middleName: middleName || "",
    lastName,
    email: email.toLowerCase(),
    password: hashedPassword,
    accountType: "User",
    roles: {
      isLandlord: false,
      isRenter,
    },
    additionalDetails: profile._id,
    image,
  });

  // Auto-link renter invite if exists
  if (pendingInvite && pendingInvite.room) {
    const room = await Room.findById(pendingInvite.room);
    if (room && room.status !== "Occupied") {
      room.renter = user._id;
      room.status = "Occupied";
      await room.save();
    }
    pendingInvite.status = "Accepted";
    await pendingInvite.save();
  }

  // Send welcome email
  try {
    await mailSender(
      user.email,
      "Welcome to Roomly!",
      `<div style="font-family: Arial; padding: 20px;">
        <h2>Welcome to Roomly, ${firstName}!</h2>
        <p>Your account has been created successfully.</p>
        ${isRenter ? "<p>You have been automatically linked to a room via an invite from your landlord.</p>" : ""}
        <p>Start exploring by logging in to your dashboard.</p>
      </div>`
    );
  } catch (emailError) {
    console.log("Error sending welcome email:", emailError);
  }

  return user;
};

/**
 * Login user
 */
exports.login = async (email, password) => {
  const user = await User.findOne({ email: email.toLowerCase() }).populate("additionalDetails");
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid credentials");
  }

  const payload = {
    email: user.email,
    id: user._id,
    accountType: user.accountType,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  user.password = undefined;
  return { user, token };
};

/**
 * Change password
 */
exports.changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashedPassword });

  try {
    await mailSender(
      user.email,
      "Password Updated Successfully",
      passwordUpdated(user.email, `${user.firstName} ${user.lastName}`)
    );
  } catch (emailError) {
    console.log("Error sending email:", emailError);
  }

  return { success: true };
};

/**
 * Request password reset token
 */
exports.requestPasswordReset = async (email) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error("User not found");
  }

  const token = crypto.randomBytes(20).toString("hex");
  const resetPasswordExpires = Date.now() + 3600000;

  await User.findByIdAndUpdate(user._id, {
    token,
    resetPasswordExpires,
  });

  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${token}`;
  try {
    await mailSender(user.email, "Reset Your Password - Roomly", passwordResetTemplate(resetLink));
  } catch (emailError) {
    console.log("Error sending email:", emailError);
  }

  return { success: true };
};

/**
 * Reset password using token
 */
exports.resetPassword = async (token, newPassword) => {
  const user = await User.findOne({
    token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Invalid or expired token");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(user._id, {
    password: hashedPassword,
    token: null,
    resetPasswordExpires: null,
  });

  try {
    await mailSender(
      user.email,
      "Password Reset Successful",
      passwordUpdated(user.email, `${user.firstName} ${user.lastName}`)
    );
  } catch (emailError) {
    console.log("Error sending email:", emailError);
  }

  return { success: true };
};

