const Room = require("../models/Room");
const User = require("../models/User");
const House = require("../models/House");
const Floor = require("../models/Floor");
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
exports.allocateRoomToRenter = async (roomId, renterId, landlordId, advanceAmount = 0) => {
  const room = await this.verifyRoomOwnership(roomId, landlordId);

  const renter = await User.findById(renterId);
  if (!renter) {
    throw new Error("Renter not found");
  }

  if (room.status === "Occupied" && room.renter) {
    throw new Error("Room is already occupied");
  }

  room.renter = renterId;
  room.status = "Occupied";
  if (advanceAmount > 0) {
    room.advanceAmount = advanceAmount;
  }
  await room.save();

  // Update user to become a renter
  await User.findByIdAndUpdate(renterId, {
    "roles.isRenter": true,
  });

  // Update floor occupied units count
  const floor = await Floor.findById(room.floor);
  if (floor) {
    floor.occupiedUnits = await Room.countDocuments({ floor: room.floor, status: "Occupied" });
    await floor.save();
  }

  // Update house occupied units count
  const house = await House.findById(room.house);
  if (house) {
    house.occupiedUnits = await Room.countDocuments({ house: room.house, status: "Occupied" });
    await house.save();
  }

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
  if (updates.images) room.images = updates.images;

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
  const { houseId, floorId } = roomData;

  // Verify house belongs to landlord
  const house = await House.findOne({ _id: houseId, landlord: landlordId });
  if (!house) {
    throw new Error("House not found or doesn't belong to you");
  }

  // Verify floor belongs to the house
  const floor = await Floor.findOne({ _id: floorId, house: houseId });
  if (!floor) {
    throw new Error("Floor not found or doesn't belong to this house");
  }

  const room = await Room.create({
    ...roomData,
    house: houseId,
    floor: floorId,
    landlord: landlordId,
    status: "Vacant",
  });

  // Update floor total units count
  floor.totalUnits = await Room.countDocuments({ floor: floorId });
  await floor.save();

  // Update house total units count
  house.totalUnits = await Room.countDocuments({ house: houseId });
  await house.save();

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
    if (["roomNumber", "roomType", "pricePerMonth", "perUnitRate", "features", "images"].includes(key)) {
      room[key] = updates[key];
    }
  });

  await room.save();
  return room;
};

/**
 * Delete vacant room
 */
exports.deleteVacantRoom = async (roomId, landlordId) => {
  const room = await this.verifyRoomOwnership(roomId, landlordId);

  if (room.status !== "Vacant") {
    throw new Error("Can only delete vacant rooms. Please remove the tenant first.");
  }

  // Update floor total units count
  const floor = await Floor.findById(room.floor);
  if (floor) {
    await Room.findByIdAndDelete(roomId);
    floor.totalUnits = await Room.countDocuments({ floor: room.floor });
    await floor.save();
  }

  // Update house total units count
  const house = await House.findById(room.house);
  if (house) {
    house.totalUnits = await Room.countDocuments({ house: room.house });
    await house.save();
  }

  return { message: "Room deleted successfully" };
};

/**
 * Search vacant rooms
 */
exports.searchVacantRooms = async (filters) => {
  const query = { status: "Vacant" };

  if (filters.location) {
    // Search in house address since rooms don't have individual addresses anymore
    const houses = await House.find({
      $or: [
        { "address.city": { $regex: filters.location, $options: "i" } },
        { "address.state": { $regex: filters.location, $options: "i" } },
      ],
    }).select("_id");
    
    const houseIds = houses.map((h) => h._id);
    query.house = { $in: houseIds };
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
    .populate("house", "name address")
    .populate("floor", "floorNumber floorName")
    .sort({ createdAt: -1 });

  return rooms;
};

/**
 * Get all rooms for a landlord's house
 */
exports.getRoomsByHouse = async (houseId, landlordId) => {
  const house = await House.findOne({ _id: houseId, landlord: landlordId });
  if (!house) {
    throw new Error("House not found or doesn't belong to you");
  }

  const rooms = await Room.find({ house: houseId })
    .populate("renter", "firstName lastName email image")
    .populate("floor", "floorNumber floorName")
    .sort({ "floor.floorNumber": 1, roomNumber: 1 });

  return rooms;
};

/**
 * Get all rooms for a landlord's floor
 */
exports.getRoomsByFloor = async (floorId, landlordId) => {
  const floor = await Floor.findById(floorId).populate("house");
  if (!floor) {
    throw new Error("Floor not found");
  }

  if (floor.house.landlord.toString() !== landlordId) {
    throw new Error("You don't have permission to view this floor");
  }

  const rooms = await Room.find({ floor: floorId })
    .populate("renter", "firstName lastName email image")
    .sort({ roomNumber: 1 });

  return rooms;
};

module.exports = exports;

