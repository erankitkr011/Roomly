const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUser,
  deleteUser,
  getAllProperties,
  getAllPayments,
  getBillDeleteRequests,
  handleDeleteRequest,
} = require("../controllers/Admin");
const { auth, isAdmin } = require("../middlewares/auth");

// All routes require authentication and admin role
router.use(auth, isAdmin);

// User management
router.get("/all-users", getAllUsers);
router.get("/user/:userId", getUser);
router.delete("/delete-user/:userId", deleteUser);

// Property management
router.get("/all-properties", getAllProperties);

// Payment management
router.get("/all-payments", getAllPayments);

// Bill deletion requests
router.get("/bill-delete-requests", getBillDeleteRequests);
router.post("/handle-delete-request/:billId", handleDeleteRequest);

module.exports = router;

