const House = require("../models/House");
const Floor = require("../models/Floor");
const Room = require("../models/Room");
const User = require("../models/User");

/**
 * Create a new house
 */
exports.createHouse = async (houseData, landlordId) => {
  const house = await House.create({
    ...houseData,
    landlord: landlordId,
  });

  // Update user to become a landlord
  await User.findByIdAndUpdate(landlordId, {
    "roles.isLandlord": true,
  });

  return house;
};

/**
 * Get all houses for a landlord
 */
exports.getLandlordHouses = async (landlordId) => {
  const houses = await House.find({ landlord: landlordId }).sort({ createdAt: -1 });
  return houses;
};

/**
 * Get single house details
 */
exports.getHouseById = async (houseId, landlordId) => {
  const house = await House.findOne({ _id: houseId, landlord: landlordId });
  if (!house) {
    throw new Error("House not found or doesn't belong to you");
  }
  return house;
};

/**
 * Update house details
 */
exports.updateHouse = async (houseId, updates, landlordId) => {
  const house = await House.findOne({ _id: houseId, landlord: landlordId });
  if (!house) {
    throw new Error("House not found or doesn't belong to you");
  }

  Object.keys(updates).forEach((key) => {
    if (["name", "description", "address", "images"].includes(key)) {
      house[key] = updates[key];
    }
  });

  await house.save();
  return house;
};

/**
 * Delete house (only if no floors/units exist)
 */
exports.deleteHouse = async (houseId, landlordId) => {
  const house = await House.findOne({ _id: houseId, landlord: landlordId });
  if (!house) {
    throw new Error("House not found or doesn't belong to you");
  }

  // Check if house has any floors
  const floorsCount = await Floor.countDocuments({ house: houseId });
  if (floorsCount > 0) {
    throw new Error("Cannot delete house with existing floors. Please delete all floors first.");
  }

  await House.findByIdAndDelete(houseId);
  return { message: "House deleted successfully" };
};

/**
 * Add floor to a house
 */
exports.addFloor = async (houseId, floorData, landlordId) => {
  const house = await House.findOne({ _id: houseId, landlord: landlordId });
  if (!house) {
    throw new Error("House not found or doesn't belong to you");
  }

  const floor = await Floor.create({
    house: houseId,
    ...floorData,
  });

  // Update house total floors count
  house.totalFloors = await Floor.countDocuments({ house: houseId });
  await house.save();

  return floor;
};

/**
 * Get all floors for a house
 */
exports.getHouseFloors = async (houseId, landlordId) => {
  const house = await House.findOne({ _id: houseId, landlord: landlordId });
  if (!house) {
    throw new Error("House not found or doesn't belong to you");
  }

  const floors = await Floor.find({ house: houseId }).sort({ floorNumber: 1 });
  return floors;
};

/**
 * Update floor
 */
exports.updateFloor = async (floorId, updates, landlordId) => {
  const floor = await Floor.findById(floorId).populate("house");
  if (!floor) {
    throw new Error("Floor not found");
  }

  if (floor.house.landlord.toString() !== landlordId) {
    throw new Error("You don't have permission to update this floor");
  }

  Object.keys(updates).forEach((key) => {
    if (["floorNumber", "floorName"].includes(key)) {
      floor[key] = updates[key];
    }
  });

  await floor.save();
  return floor;
};

/**
 * Delete floor (only if no units exist)
 */
exports.deleteFloor = async (floorId, landlordId) => {
  const floor = await Floor.findById(floorId).populate("house");
  if (!floor) {
    throw new Error("Floor not found");
  }

  if (floor.house.landlord.toString() !== landlordId) {
    throw new Error("You don't have permission to delete this floor");
  }

  // Check if floor has any rooms
  const roomsCount = await Room.countDocuments({ floor: floorId });
  if (roomsCount > 0) {
    throw new Error("Cannot delete floor with existing units. Please delete all units first.");
  }

  await Floor.findByIdAndDelete(floorId);

  // Update house total floors count
  const house = await House.findById(floor.house._id);
  house.totalFloors = await Floor.countDocuments({ house: floor.house._id });
  await house.save();

  return { message: "Floor deleted successfully" };
};

/**
 * Get floor details with all units
 */
exports.getFloorWithUnits = async (floorId, landlordId) => {
  const floor = await Floor.findById(floorId).populate("house");
  if (!floor) {
    throw new Error("Floor not found");
  }

  if (floor.house.landlord.toString() !== landlordId) {
    throw new Error("You don't have permission to view this floor");
  }

  const units = await Room.find({ floor: floorId })
    .populate("renter", "firstName lastName email image")
    .sort({ roomNumber: 1 });

  return {
    floor,
    units,
  };
};

/**
 * Verify house ownership
 */
exports.verifyHouseOwnership = async (houseId, landlordId) => {
  const house = await House.findOne({ _id: houseId, landlord: landlordId });
  if (!house) {
    throw new Error("House not found or doesn't belong to you");
  }
  return house;
};

/**
 * Verify floor ownership (through house)
 */
exports.verifyFloorOwnership = async (floorId, landlordId) => {
  const floor = await Floor.findById(floorId).populate("house");
  if (!floor) {
    throw new Error("Floor not found");
  }

  if (floor.house.landlord.toString() !== landlordId) {
    throw new Error("You don't have permission to access this floor");
  }
  return floor;
};

/**
 * Get house overview with stats
 */
exports.getHouseOverview = async (houseId, landlordId) => {
  const house = await this.getHouseById(houseId, landlordId);

  const floors = await Floor.find({ house: houseId }).sort({ floorNumber: 1 });
  const totalUnits = await Room.countDocuments({ house: houseId });
  const occupiedUnits = await Room.countDocuments({ house: houseId, status: "Occupied" });
  const vacantUnits = totalUnits - occupiedUnits;

  return {
    house,
    stats: {
      totalFloors: floors.length,
      totalUnits,
      occupiedUnits,
      vacantUnits,
      occupancyRate: totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(2) : 0,
    },
    floors,
  };
};

module.exports = exports;
