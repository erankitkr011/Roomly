const renterService = require("../services/renterService");
const roomService = require("../services/roomService");
const billService = require("../services/billService");
const paymentService = require("../services/paymentService");
const notificationService = require("../services/notificationService");
const houseService = require("../services/houseService");

// ==================== HOUSE MANAGEMENT ====================

// Create a new house
exports.createHouse = async (req, res) => {
  try {
    const { name, description, address, images } = req.body;
    if (!name || !address || !address.city || !address.state || !address.pincode) {
      return res.status(400).json({
        success: false,
        message: "Name and complete address are required",
      });
    }
    const house = await houseService.createHouse(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "House created successfully",
      house,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error creating house",
    });
  }
};

// Get all houses for landlord
exports.getAllHouses = async (req, res) => {
  try {
    const houses = await houseService.getLandlordHouses(req.user.id);
    return res.status(200).json({
      success: true,
      count: houses.length,
      houses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching houses",
    });
  }
};

// Get single house details with overview
exports.getHouseOverview = async (req, res) => {
  try {
    const overview = await houseService.getHouseOverview(req.params.houseId, req.user.id);
    return res.status(200).json({
      success: true,
      data: overview,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error fetching house overview",
    });
  }
};

// Update house
exports.updateHouse = async (req, res) => {
  try {
    const house = await houseService.updateHouse(req.params.houseId, req.body, req.user.id);
    return res.status(200).json({
      success: true,
      message: "House updated successfully",
      house,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error updating house",
    });
  }
};

// Delete house
exports.deleteHouse = async (req, res) => {
  try {
    const result = await houseService.deleteHouse(req.params.houseId, req.user.id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error deleting house",
    });
  }
};

// Add floor to house
exports.addFloor = async (req, res) => {
  try {
    const { floorNumber, floorName } = req.body;
    if (floorNumber === undefined || floorNumber === null) {
      return res.status(400).json({
        success: false,
        message: "Floor number is required",
      });
    }
    const floor = await houseService.addFloor(req.params.houseId, req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "Floor added successfully",
      floor,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error adding floor",
    });
  }
};

// Get all floors for a house
exports.getHouseFloors = async (req, res) => {
  try {
    const floors = await houseService.getHouseFloors(req.params.houseId, req.user.id);
    return res.status(200).json({
      success: true,
      count: floors.length,
      floors,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error fetching floors",
    });
  }
};

// Update floor
exports.updateFloor = async (req, res) => {
  try {
    const floor = await houseService.updateFloor(req.params.floorId, req.body, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Floor updated successfully",
      floor,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error updating floor",
    });
  }
};

// Delete floor
exports.deleteFloor = async (req, res) => {
  try {
    const result = await houseService.deleteFloor(req.params.floorId, req.user.id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error deleting floor",
    });
  }
};

// Get floor with all units
exports.getFloorWithUnits = async (req, res) => {
  try {
    const data = await houseService.getFloorWithUnits(req.params.floorId, req.user.id);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error fetching floor details",
    });
  }
};

// Get all rooms for a house
exports.getHouseRooms = async (req, res) => {
  try {
    const rooms = await roomService.getRoomsByHouse(req.params.houseId, req.user.id);
    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error fetching rooms",
    });
  }
};

// Get all rooms for a floor
exports.getFloorRooms = async (req, res) => {
  try {
    const rooms = await roomService.getRoomsByFloor(req.params.floorId, req.user.id);
    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error fetching rooms",
    });
  }
};

// ==================== RENTER MANAGEMENT ====================

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
    const { renterId, roomId, advanceAmount } = req.body;
    const room = await roomService.allocateRoomToRenter(roomId, renterId, req.user.id, advanceAmount || 0);
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

// Approve cash payment (renter-initiated)
exports.approveCashPayment = async (req, res) => {
  try {
    const payment = await paymentService.approveCashPayment(req.params.paymentId, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Cash payment approved successfully",
      payment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error approving payment",
    });
  }
};

// Post vacant room
exports.postVacantRoom = async (req, res) => {
  try {
    const { houseId, floorId, roomNumber, roomType, pricePerMonth, perUnitRate, features, images } = req.body;
    if (!houseId || !floorId || !roomNumber || !roomType || !pricePerMonth) {
      return res.status(400).json({
        success: false,
        message: "House, floor, room number, room type, and price are required",
      });
    }
    const room = await roomService.createVacantRoom(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "Vacant room posted successfully",
      room,
    });
  } catch (error) {
    return res.status(400).json({
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

// Delete vacant room
exports.deleteVacantRoom = async (req, res) => {
  try {
    const result = await roomService.deleteVacantRoom(req.params.roomId, req.user.id);
    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error deleting room",
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
