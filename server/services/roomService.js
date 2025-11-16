const Room = require("../models/Room");
const User = require("../models/User");
const Notification = require("../models/Notification");

/**
 * Verify room belongs to landlord
 */
exports.verifyRoomOwnership = async (roomId, landlordId) => {
  const room = await Room.findById(roomId);
  if (!room || room.landlord.toString() !== landlordId) {
    throw new Error("Room not found or doesn't belong to you");
  }
  return room;
};

/**
 * Allocate room to renter
 */
exports.allocateRoomToRenter = async (roomId, renterId, landlordId) => {
  const room = await this.verifyRoomOwnership(roomId, landlordId);

  const renter = await User.findById(renterId);
  if (!renter || renter.accountType !== "Renter") {
    throw new Error("Renter not found");
  }

  if (room.status === "Occupied" && room.renter) {
    throw new Error("Room is already occupied");
  }

  room.renter = renterId;
  room.status = "Occupied";
  await room.save();

  await Notification.create({
    sender: landlordId,
    receiver: renterId,
    message: `You have been allocated to room ${room.roomNumber}`,
    type: "System",
  });

  return room;
};

/**
 * Update allocated room
 */
exports.updateAllocatedRoom = async (roomId, updates, landlordId) => {
  const room = await this.verifyRoomOwnership(roomId, landlordId);

  if (updates.pricePerMonth !== undefined) room.pricePerMonth = updates.pricePerMonth;
  if (updates.perUnitRate !== undefined) room.perUnitRate = updates.perUnitRate;
  if (updates.features) room.features = updates.features;
  if (updates.floorNo !== undefined) room.floorNo = updates.floorNo;

  await room.save();

  if (room.renter) {
    await Notification.create({
      sender: landlordId,
      receiver: room.renter,
      message: `Room ${room.roomNumber} details have been updated`,
      type: "System",
    });
  }

  return room;
};

/**
 * Create vacant room
 */
exports.createVacantRoom = async (roomData, landlordId) => {
  const room = await Room.create({
    ...roomData,
    landlord: landlordId,
    status: "Vacant",
  });

  return room;
};

/**
 * Update vacant room
 */
exports.updateVacantRoom = async (roomId, updates, landlordId) => {
  const room = await this.verifyRoomOwnership(roomId, landlordId);

  if (room.status !== "Vacant") {
    throw new Error("Can only update vacant rooms");
  }

  Object.keys(updates).forEach((key) => {
    if (["houseName", "roomNumber", "roomType", "floorNo", "pricePerMonth", "perUnitRate", "features", "address", "images"].includes(key)) {
      room[key] = updates[key];
    }
  });

  await room.save();
  return room;
};

/**
 * Search vacant rooms
 */
exports.searchVacantRooms = async (filters) => {
  const query = { status: "Vacant" };

  if (filters.location) {
    query["address.city"] = { $regex: filters.location, $options: "i" };
  }

  if (filters.roomType) {
    query.roomType = filters.roomType;
  }

  if (filters.minPrice || filters.maxPrice) {
    query.pricePerMonth = {};
    if (filters.minPrice) query.pricePerMonth.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.pricePerMonth.$lte = Number(filters.maxPrice);
  }

  const rooms = await Room.find(query)
    .populate("landlord", "firstName lastName email")
    .sort({ createdAt: -1 });

  return rooms;
};

