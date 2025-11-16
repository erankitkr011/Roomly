const User = require("../models/User");
const Room = require("../models/Room");
const Bill = require("../models/Bill");
const Payment = require("../models/Payment");

// Get all users (landlords & renters)
exports.getAllUsers = async (req, res) => {
  try {
    const { accountType } = req.query;

    const query = {};
    if (accountType) {
      query.accountType = accountType;
    }

    const users = await User.find(query)
      .populate("additionalDetails")
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching users",
    });
  }
};

// View user by ID
exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate("additionalDetails")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
};

// Delete or suspend user
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check for active rooms/bills
    if (user.accountType === "Landlord") {
      const rooms = await Room.find({ landlord: userId });
      if (rooms.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete landlord with active properties",
        });
      }
    }

    if (user.accountType === "Renter") {
      const pendingBills = await Bill.find({ renter: userId, status: { $ne: "Paid" } });
      if (pendingBills.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete renter with pending bills",
        });
      }
    }

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
    });
  }
};

// View all properties
exports.getAllProperties = async (req, res) => {
  try {
    const { status, roomType } = req.query;

    const query = {};
    if (status) query.status = status;
    if (roomType) query.roomType = roomType;

    const rooms = await Room.find(query)
      .populate("landlord", "firstName lastName email")
      .populate("renter", "firstName lastName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching properties",
    });
  }
};

// View all transactions
exports.getAllPayments = async (req, res) => {
  try {
    const { status, mode } = req.query;

    const query = {};
    if (status) query.status = status;
    if (mode) query.mode = mode;

    const payments = await Payment.find(query)
      .populate("bill")
      .populate("renter", "firstName lastName email")
      .populate("landlord", "firstName lastName email")
      .populate("room", "roomNumber roomType")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payments",
    });
  }
};

// Handle bill deletion requests
exports.getBillDeleteRequests = async (req, res) => {
  try {
    const bills = await Bill.find({
      "deleteRequest.requested": true,
    })
      .populate("landlord", "firstName lastName email")
      .populate("renter", "firstName lastName email")
      .populate("room", "roomNumber roomType")
      .sort({ "deleteRequest.requestedAt": -1 });

    return res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching deletion requests",
    });
  }
};

// Approve or reject bill deletion
exports.handleDeleteRequest = async (req, res) => {
  try {
    const { billId } = req.params;
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'approve' or 'reject'",
      });
    }

    const bill = await Bill.findById(billId);
    if (!bill || !bill.deleteRequest.requested) {
      return res.status(404).json({
        success: false,
        message: "Bill deletion request not found",
      });
    }

    if (action === "approve") {
      // Check if bill is paid
      if (bill.status !== "Paid") {
        return res.status(400).json({
          success: false,
          message: "Can only delete paid bills",
        });
      }

      await Bill.findByIdAndDelete(billId);
      return res.status(200).json({
        success: true,
        message: "Bill deleted successfully",
      });
    } else {
      // Reject deletion request
      bill.deleteRequest = {
        requested: false,
        reason: "",
        requestedAt: null,
      };
      await bill.save();

      return res.status(200).json({
        success: true,
        message: "Bill deletion request rejected",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error handling deletion request",
    });
  }
};

