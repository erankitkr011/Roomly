const Payment = require("../models/Payment");
const Bill = require("../models/Bill");
const Notification = require("../models/Notification");
const { mailSender } = require("../utils/mailSender");
const { paymentConfirmationTemplate } = require("../mail/templates/paymentConfirmationTemplate");
const Razorpay = require("razorpay");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

/**
 * Create Razorpay order
 */
exports.createRazorpayOrder = async (bill) => {
  const options = {
    amount: bill.totalAmount * 100,
    currency: "INR",
    receipt: `bill_${bill._id}_${Date.now()}`,
    notes: {
      billId: bill._id.toString(),
      renterId: bill.renter._id.toString(),
      landlordId: bill.landlord._id.toString(),
      month: bill.month,
    },
  };

  const order = await razorpay.orders.create(options);
  return order;
};

/**
 * Create payment record
 */
exports.createPayment = async (paymentData) => {
  const payment = await Payment.create(paymentData);
  return payment;
};

/**
 * Mark bill as paid (cash - landlord)
 */
exports.markBillAsPaidCash = async (billId, landlordId) => {
  const bill = await Bill.findById(billId).populate("renter");
  if (!bill || bill.landlord.toString() !== landlordId) {
    throw new Error("Bill not found or doesn't belong to you");
  }

  if (bill.status === "Paid") {
    throw new Error("Bill is already paid");
  }

  const payment = await Payment.create({
    bill: billId,
    renter: bill.renter._id,
    landlord: landlordId,
    room: bill.room,
    amountPaid: bill.totalAmount,
    mode: "Cash",
    paymentMethod: "Cash",
    status: "Successful",
    paymentDate: new Date(),
  });

  bill.status = "Paid";
  await bill.save();

  try {
    await mailSender(
      bill.renter.email,
      "Payment Received - Cash",
      paymentConfirmationTemplate(
        `${bill.renter.firstName} ${bill.renter.lastName}`,
        bill.totalAmount,
        bill.month,
        "Cash"
      )
    );
  } catch (emailError) {
    console.log("Error sending payment email:", emailError);
  }

  return payment;
};

/**
 * Mark bill as paid by cash (renter)
 */
exports.markBillAsPaidByCash = async (billId, renterId) => {
  const bill = await Bill.findById(billId).populate("room").populate("landlord").populate("renter");
  if (!bill || bill.renter._id.toString() !== renterId) {
    throw new Error("Bill not found or doesn't belong to you");
  }

  if (bill.status === "Paid") {
    throw new Error("Bill is already paid");
  }

  const payment = await Payment.create({
    bill: billId,
    renter: renterId,
    landlord: bill.landlord._id,
    room: bill.room._id,
    amountPaid: bill.totalAmount,
    mode: "Cash",
    paymentMethod: "Cash",
    status: "Processing",
    paymentDate: new Date(),
  });

  await Notification.create({
    sender: renterId,
    receiver: bill.landlord._id,
    message: `Cash payment marked for bill ${bill.month}. Please verify.`,
    type: "Payment",
  });

  return payment;
};

/**
 * Verify and complete online payment
 */
exports.verifyOnlinePayment = async (paymentData, billId, renterId) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

  const bill = await Bill.findById(billId)
    .populate("room")
    .populate("landlord")
    .populate("renter");

  if (!bill || bill.renter._id.toString() !== renterId) {
    throw new Error("Bill not found or doesn't belong to you");
  }

  // TODO: Verify Razorpay signature in production
  // const crypto = require("crypto");
  // const generatedSignature = crypto
  //   .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  //   .update(razorpay_order_id + "|" + razorpay_payment_id)
  //   .digest("hex");
  // if (generatedSignature !== razorpay_signature) {
  //   throw new Error("Invalid payment signature");
  // }

  const payment = await Payment.create({
    bill: billId,
    renter: renterId,
    landlord: bill.landlord._id,
    room: bill.room._id,
    amountPaid: bill.totalAmount,
    mode: "Online",
    paymentMethod: "Razorpay",
    transactionId: razorpay_payment_id,
    status: "Successful",
    paymentDate: new Date(),
    invoiceUrl: `${process.env.BACKEND_URL || "http://localhost:4000"}/api/v1/renter/download-invoice/${billId}`,
  });

  bill.status = "Paid";
  await bill.save();

  try {
    await mailSender(
      bill.renter.email,
      "Payment Confirmed - Online",
      paymentConfirmationTemplate(
        `${bill.renter.firstName} ${bill.renter.lastName}`,
        bill.totalAmount,
        bill.month,
        "Online (Razorpay)"
      )
    );
  } catch (emailError) {
    console.log("Error sending payment email:", emailError);
  }

  await Notification.create({
    sender: renterId,
    receiver: bill.landlord._id,
    message: `Payment received for bill ${bill.month}`,
    type: "Payment",
  });

  return payment;
};

/**
 * Get invoice data
 */
exports.getInvoiceData = async (billId, renterId) => {
  const bill = await Bill.findById(billId)
    .populate("room", "roomNumber roomType houseName")
    .populate("landlord", "firstName lastName email contactNumber")
    .populate("renter", "firstName lastName email");

  if (!bill || bill.renter._id.toString() !== renterId) {
    throw new Error("Bill not found or doesn't belong to you");
  }

  const payment = await Payment.findOne({ bill: billId, status: "Successful" });
  if (!payment) {
    throw new Error("Payment not found or not completed");
  }

  return {
    invoiceNumber: `INV-${billId}`,
    date: new Date().toISOString().split("T")[0],
    bill,
    payment,
  };
};

