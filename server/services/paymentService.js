const Payment = require("../models/Payment");
const Bill = require("../models/Bill");
const Notification = require("../models/Notification");
const { mailSender } = require("../utils/mailSender");
const { paymentConfirmationTemplate } = require("../mail/templates/paymentConfirmationTemplate");
const Razorpay = require("razorpay");
const crypto = require("crypto");
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

  // Verify Razorpay signature
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");
  if (generatedSignature !== razorpay_signature) {
    throw new Error("Invalid payment signature");
  }

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

/**
 * Approve cash payment (landlord action)
 */
exports.approveCashPayment = async (paymentId, landlordId) => {
  const payment = await Payment.findById(paymentId)
    .populate("renter", "firstName lastName email")
    .populate("bill");

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.landlord.toString() !== landlordId) {
    throw new Error("Payment doesn't belong to you");
  }

  if (payment.status === "Successful") {
    throw new Error("Payment is already approved");
  }

  payment.status = "Successful";
  await payment.save();

  const bill = await Bill.findById(payment.bill._id || payment.bill);
  if (bill) {
    bill.status = "Paid";
    await bill.save();
  }

  // Notify renter
  await Notification.create({
    sender: landlordId,
    title: "Payment Approved",
    message: `Your cash payment for ${bill?.month || "the bill"} has been approved.`,
    type: "Payment",
    targetTenants: [payment.renter._id],
  });

  try {
    await mailSender(
      payment.renter.email,
      "Cash Payment Approved",
      paymentConfirmationTemplate(
        `${payment.renter.firstName} ${payment.renter.lastName}`,
        payment.amountPaid,
        bill?.month || "N/A",
        "Cash (Approved)"
      )
    );
  } catch (emailError) {
    console.log("Error sending approval email:", emailError);
  }

  return payment;
};

/**
 * Generate PDF invoice
 */
exports.generateInvoicePDF = async (billId, renterId) => {
  const PDFDocument = require("pdfkit");

  const bill = await Bill.findById(billId)
    .populate("room", "roomNumber roomType pricePerMonth perUnitRate")
    .populate("landlord", "firstName lastName email contactNumber")
    .populate("renter", "firstName lastName email")
    .populate("house", "name address");

  if (!bill || bill.renter._id.toString() !== renterId) {
    throw new Error("Bill not found or doesn't belong to you");
  }

  const payment = await Payment.findOne({ bill: billId, status: "Successful" });
  if (!payment) {
    throw new Error("Payment not found or not completed");
  }

  const invoiceNumber = `INV-${bill._id.toString().slice(-8).toUpperCase()}`;
  const invoiceDate = payment.paymentDate
    ? new Date(payment.paymentDate).toLocaleDateString("en-IN")
    : new Date().toLocaleDateString("en-IN");

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("ROOMLY", { align: "center" });
    doc.fontSize(10).font("Helvetica").text("Property Management System", { align: "center" });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#4f46e5");
    doc.moveDown();

    // Invoice details
    doc.fontSize(16).font("Helvetica-Bold").text("INVOICE", { align: "right" });
    doc.fontSize(10).font("Helvetica")
      .text(`Invoice #: ${invoiceNumber}`, { align: "right" })
      .text(`Date: ${invoiceDate}`, { align: "right" })
      .text(`Payment Mode: ${payment.paymentMethod}`, { align: "right" });

    if (payment.transactionId) {
      doc.text(`Transaction ID: ${payment.transactionId}`, { align: "right" });
    }

    doc.moveDown();

    // From / To
    doc.fontSize(12).font("Helvetica-Bold").text("From:");
    doc.fontSize(10).font("Helvetica")
      .text(`${bill.landlord.firstName} ${bill.landlord.lastName}`)
      .text(`${bill.landlord.email}`)
      .text(`${bill.landlord.contactNumber || ""}`);

    doc.moveDown(0.5);
    doc.fontSize(12).font("Helvetica-Bold").text("To:");
    doc.fontSize(10).font("Helvetica")
      .text(`${bill.renter.firstName} ${bill.renter.lastName}`)
      .text(`${bill.renter.email}`);

    doc.moveDown();

    // Property details
    doc.fontSize(12).font("Helvetica-Bold").text("Property Details:");
    doc.fontSize(10).font("Helvetica")
      .text(`House: ${bill.house?.name || "N/A"}`)
      .text(`Room: ${bill.room.roomType} #${bill.room.roomNumber}`)
      .text(`Billing Month: ${bill.month}`);

    doc.moveDown();

    // Bill breakdown table
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#e5e7eb");
    doc.moveDown(0.5);

    doc.fontSize(12).font("Helvetica-Bold").text("Bill Breakdown:");
    doc.moveDown(0.5);

    const drawRow = (label, value) => {
      const y = doc.y;
      doc.fontSize(10).font("Helvetica").text(label, 60, y, { width: 300 });
      doc.text(`₹ ${value.toFixed(2)}`, 400, y, { width: 140, align: "right" });
      doc.moveDown(0.3);
    };

    const rent = bill.room.pricePerMonth || 0;
    drawRow("Rent", rent);

    if (bill.unitsConsumed > 0) {
      drawRow(`Electricity (${bill.unitsConsumed} units × ₹${bill.room.perUnitRate || 0})`, bill.electricityBill || 0);
    }

    if (bill.otherBills?.water > 0) drawRow("Water", bill.otherBills.water);
    if (bill.otherBills?.maintenance > 0) drawRow("Maintenance", bill.otherBills.maintenance);
    if (bill.otherBills?.custom > 0) {
      drawRow(bill.otherBills.customDescription || "Custom Charge", bill.otherBills.custom);
    }

    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke("#4f46e5");
    doc.moveDown(0.5);

    // Total
    const y = doc.y;
    doc.fontSize(14).font("Helvetica-Bold").text("Total Amount:", 60, y, { width: 300 });
    doc.text(`₹ ${bill.totalAmount.toFixed(2)}`, 400, y, { width: 140, align: "right" });

    doc.moveDown(2);
    doc.fontSize(10).font("Helvetica").fillColor("#6b7280")
      .text("This is a computer-generated invoice. No signature required.", { align: "center" })
      .text("Generated by Roomly — Property Management System", { align: "center" });

    doc.end();
  });
};
