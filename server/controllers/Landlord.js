const renterService = require("../services/renterService");
const roomService = require("../services/roomService");
const billService = require("../services/billService");
const paymentService = require("../services/paymentService");
const notificationService = require("../services/notificationService");

// Add renter by email
exports.addRenter = async (req, res) => {
  try {
    const { email, roomId } = req.body;
    const result = await renterService.handleAddRenter(email, req.user.id, roomId);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error adding renter",
    });
  }
};

// Update renter details
exports.updateRenter = async (req, res) => {
  try {
    await renterService.verifyRenterOwnership(req.params.renterId, req.user.id);
    const renter = await renterService.updateRenterDetails(req.params.renterId, req.body);
    return res.status(200).json({
      success: true,
      message: "Renter details updated successfully",
      renter,
    });
  } catch (error) {
    return res.status(error.message.includes("not found") ? 404 : 403).json({
      success: false,
      message: error.message || "Error updating renter",
    });
  }
};

// Allocate room to renter
exports.allocateRoom = async (req, res) => {
  try {
    const { renterId, roomId } = req.body;
    const room = await roomService.allocateRoomToRenter(roomId, renterId, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Room allocated successfully",
      room,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error allocating room",
    });
  }
};

// Update allocated room
exports.updateAllocatedRoom = async (req, res) => {
  try {
    const room = await roomService.updateAllocatedRoom(req.params.roomId, req.body, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error updating room",
    });
  }
};

// Create and send monthly bill
exports.sendBill = async (req, res) => {
  try {
    const bill = await billService.createBill(req.body, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Bill created and sent successfully",
      bill,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error creating bill",
    });
  }
};

// Update existing bill
exports.updateBill = async (req, res) => {
  try {
    const bill = await billService.updateBill(req.params.billId, req.body, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Bill updated successfully. Renter needs to verify.",
      bill,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error updating bill",
    });
  }
};

// Request bill deletion
exports.requestDeleteBill = async (req, res) => {
  try {
    const bill = await billService.requestBillDeletion(req.params.billId, req.body.reason, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Bill deletion request submitted. Waiting for admin approval.",
      bill,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error requesting bill deletion",
    });
  }
};

// Send notification to all renters
exports.sendNotification = async (req, res) => {
  try {
    const { message, title } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }
    const count = await notificationService.sendNotificationToAllRenters(req.user.id, message, title);
    return res.status(200).json({
      success: true,
      message: `Notification sent to ${count} renters`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error sending notification",
    });
  }
};

// Get all renters
exports.getAllRenters = async (req, res) => {
  try {
    const renters = await renterService.getAllRentersForLandlord(req.user.id);
    return res.status(200).json({
      success: true,
      count: renters.length,
      renters,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching renters",
    });
  }
};

// View all bills of a renter
exports.getRenterBills = async (req, res) => {
  try {
    await renterService.verifyRenterOwnership(req.params.renterId, req.user.id);
    const bills = await billService.getRenterBills(req.params.renterId, req.user.id);
    return res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error fetching bills",
    });
  }
};

// Mark bill as paid (cash payment)
exports.payCashBill = async (req, res) => {
  try {
    const payment = await paymentService.markBillAsPaidCash(req.params.billId, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Bill marked as paid",
      payment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error processing payment",
    });
  }
};

// Post vacant room
exports.postVacantRoom = async (req, res) => {
  try {
    const { houseName, roomNumber, roomType, floorNo, pricePerMonth, perUnitRate, features, address, images } = req.body;
    if (!roomNumber || !roomType || !floorNo || !pricePerMonth || !address) {
      return res.status(400).json({
        success: false,
        message: "Required fields are missing",
      });
    }
    const room = await roomService.createVacantRoom(req.body, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Vacant room posted successfully",
      room,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error posting vacant room",
    });
  }
};

// Update vacant room
exports.updateVacantRoom = async (req, res) => {
  try {
    const room = await roomService.updateVacantRoom(req.params.roomId, req.body, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error updating room",
    });
  }
};

// Delete renter (with request)
exports.deleteRenter = async (req, res) => {
  try {
    const pendingBills = await billService.checkPendingBills(req.params.renterId, req.user.id);
    if (pendingBills.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete renter with pending bills",
      });
    }
    await renterService.deleteRenter(req.params.renterId, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Renter removed successfully",
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error deleting renter",
    });
  }
};
