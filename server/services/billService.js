const Bill = require("../models/Bill");
const Room = require("../models/Room");
const Notification = require("../models/Notification");
const { mailSender } = require("../utils/mailSender");
const { billNotificationTemplate } = require("../mail/templates/billNotificationTemplate");
const User = require("../models/User");

/**
 * Verify bill belongs to landlord
 */
exports.verifyBillOwnership = async (billId, landlordId) => {
  const bill = await Bill.findById(billId);
  if (!bill || bill.landlord.toString() !== landlordId) {
    throw new Error("Bill not found or doesn't belong to you");
  }
  return bill;
};

/**
 * Verify bill belongs to renter
 */
exports.verifyBillRenter = async (billId, renterId) => {
  const bill = await Bill.findById(billId);
  if (!bill || bill.renter.toString() !== renterId) {
    throw new Error("Bill not found or doesn't belong to you");
  }
  return bill;
};

/**
 * Create and send bill
 */
exports.createBill = async (billData, landlordId) => {
  const { roomId, month, currentReading, previousReading, meterImage, otherBills } = billData;

  const room = await Room.findById(roomId);
  if (!room || room.landlord.toString() !== landlordId) {
    throw new Error("Room not found or doesn't belong to you");
  }

  if (!room.renter) {
    throw new Error("Room is not allocated to any renter");
  }

  const existingBill = await Bill.findOne({
    room: roomId,
    month,
    renter: room.renter,
  });

  if (existingBill) {
    throw new Error("Bill for this month already exists");
  }

  const bill = await Bill.create({
    house: room.house,
    room: roomId,
    month,
    currentReading,
    previousReading: previousReading || room.currentMeterReading || 0,
    meterImage: meterImage || null,
    landlord: landlordId,
    renter: room.renter,
    otherBills: otherBills || {
      water: 0,
      maintenance: 0,
      custom: 0,
      customDescription: "",
    },
  });

  await Notification.create({
    sender: landlordId,
    title: "New Bill",
    message: `New bill generated for ${month}`,
    type: "Bill",
    targetTenants: [room.renter],
    link: `/renter/bills/${bill._id}`,
  });

  try {
    const renter = await User.findById(room.renter);
    await mailSender(
      renter.email,
      `New Bill Generated - ${month}`,
      billNotificationTemplate(`${renter.firstName} ${renter.lastName}`, month, bill.totalAmount)
    );
  } catch (emailError) {
    console.log("Error sending bill email:", emailError);
  }

  return bill;
};

/**
 * Update bill
 */
exports.updateBill = async (billId, updates, landlordId) => {
  const bill = await this.verifyBillOwnership(billId, landlordId);

  if (bill.status === "Paid") {
    throw new Error("Cannot update paid bill");
  }

  if (updates.currentReading !== undefined) bill.currentReading = updates.currentReading;
  if (updates.previousReading !== undefined) bill.previousReading = updates.previousReading;
  if (updates.meterImage) bill.meterImage = updates.meterImage;
  if (updates.otherBills) bill.otherBills = { ...bill.otherBills, ...updates.otherBills };
  if (updates.month) bill.month = updates.month;

  bill.status = "Pending";
  await bill.save();

  await Notification.create({
    sender: landlordId,
    receiver: bill.renter,
    message: `Bill for ${bill.month} has been updated. Please verify.`,
    type: "Bill",
    link: `/renter/bills/${bill._id}`,
  });

  return bill;
};

/**
 * Request bill deletion
 */
exports.requestBillDeletion = async (billId, reason, landlordId) => {
  const bill = await this.verifyBillOwnership(billId, landlordId);

  bill.deleteRequest = {
    requested: true,
    reason: reason || "",
    requestedAt: new Date(),
  };

  await bill.save();
  return bill;
};

/**
 * Get bills for renter
 */
exports.getRenterBills = async (renterId, landlordId = null) => {
  const query = { renter: renterId };
  if (landlordId) query.landlord = landlordId;

  const bills = await Bill.find(query)
    .populate("room", "roomNumber roomType houseName")
    .populate("landlord", "firstName lastName email")
    .sort({ createdAt: -1 });

  return bills;
};

/**
 * Get single bill with details
 */
exports.getBillDetails = async (billId) => {
  const bill = await Bill.findById(billId)
    .populate("room", "roomNumber roomType houseName pricePerMonth perUnitRate")
    .populate("landlord", "firstName lastName email contactNumber")
    .populate("renter", "firstName lastName email");

  if (!bill) {
    throw new Error("Bill not found");
  }

  return bill;
};

/**
 * Verify bill (renter action)
 */
exports.verifyBill = async (billId, renterId) => {
  const bill = await this.verifyBillRenter(billId, renterId);

  bill.status = "Verified";
  await bill.save();

  await Notification.create({
    sender: renterId,
    receiver: bill.landlord,
    message: `Bill for ${bill.month} has been verified`,
    type: "Bill",
  });

  return bill;
};

/**
 * Check for pending bills
 */
exports.checkPendingBills = async (renterId, landlordId) => {
  const pendingBills = await Bill.find({
    renter: renterId,
    landlord: landlordId,
    status: { $ne: "Paid" },
  });

  return pendingBills;
};

