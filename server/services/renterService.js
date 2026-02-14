const User = require("../models/User");
const Room = require("../models/Room");
const Notification = require("../models/Notification");
const RenterInvite = require("../models/RenterInvite");
const { mailSender } = require("../utils/mailSender");
const { renterInviteTemplate } = require("../mail/templates/renterInviteTemplate");
const crypto = require("crypto");
require("dotenv").config();

/**
 * Check if renter exists and handle accordingly
 */
exports.handleAddRenter = async (email, landlordId, roomId = null) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    // Can't add yourself as a renter
    if (existingUser._id.toString() === landlordId.toString()) {
      throw new Error("You cannot add yourself as a renter");
    }

    await Notification.create({
      sender: landlordId,
      receiver: existingUser._id,
      message: `Landlord wants to add you as a renter`,
      type: "System",
    });

    return { type: "notification", message: "Notification sent to renter for approval" };
  } else {
    const token = crypto.randomBytes(32).toString("hex");
    const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/accept-invite/${token}`;

    await RenterInvite.create({
      email: email.toLowerCase(),
      landlord: landlordId,
      room: roomId,
      token,
    });

    const landlord = await User.findById(landlordId);
    try {
      await mailSender(
        email,
        "Invitation to Join Roomly",
        renterInviteTemplate(`${landlord.firstName} ${landlord.lastName}`, inviteLink)
      );
    } catch (emailError) {
      console.log("Error sending invite email:", emailError);
    }

    return { type: "invite", message: "Invitation sent to renter email" };
  }
};

/**
 * Verify renter belongs to landlord
 */
exports.verifyRenterOwnership = async (renterId, landlordId) => {
  const renter = await User.findById(renterId);
  if (!renter || renter.accountType !== "Renter") {
    throw new Error("Renter not found");
  }

  const room = await Room.findOne({ landlord: landlordId, renter: renterId });
  if (!room) {
    throw new Error("This renter is not under your management");
  }

  return { renter, room };
};

/**
 * Update renter details
 */
exports.updateRenterDetails = async (renterId, updates) => {
  const renter = await User.findById(renterId).populate("additionalDetails");
  if (!renter || renter.accountType !== "Renter") {
    throw new Error("Renter not found");
  }

  if (updates.contactNumber || updates.address) {
    const profile = renter.additionalDetails;
    if (updates.contactNumber) profile.contactNumber = updates.contactNumber;
    await profile.save();
  }

  if (updates.firstName) renter.firstName = updates.firstName;
  if (updates.lastName) renter.lastName = updates.lastName;
  if (updates.middleName) renter.middleName = updates.middleName;

  await renter.save();
  return renter;
};

/**
 * Get all renters for a landlord
 */
exports.getAllRentersForLandlord = async (landlordId) => {
  const rooms = await Room.find({ landlord: landlordId, renter: { $ne: null } })
    .populate("renter", "firstName lastName email image")
    .populate("renter.additionalDetails", "contactNumber");

  return rooms.map((room) => ({
    renter: room.renter,
    room: {
      id: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      pricePerMonth: room.pricePerMonth,
      perUnitRate: room.perUnitRate || 8,
      currentMeterReading: room.currentMeterReading || 0,
    },
  }));
};

/**
 * Delete renter (remove from room)
 */
exports.deleteRenter = async (renterId, landlordId) => {
  const room = await Room.findOne({ landlord: landlordId, renter: renterId });
  if (!room) {
    throw new Error("This renter is not under your management");
  }

  room.renter = null;
  room.status = "Vacant";
  await room.save();

  await Notification.create({
    sender: landlordId,
    receiver: renterId,
    message: "You have been removed from the property",
    type: "System",
  });

  return { success: true };
};

