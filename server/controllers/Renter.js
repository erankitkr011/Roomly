const profileService = require("../services/profileService");
const billService = require("../services/billService");
const paymentService = require("../services/paymentService");
const roomService = require("../services/roomService");

// Update renter profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await profileService.updateProfile(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Error updating profile",
    });
  }
};

// View all bills
exports.getAllBills = async (req, res) => {
  try {
    const bills = await billService.getRenterBills(req.user.id);
    return res.status(200).json({
      success: true,
      count: bills.length,
      bills,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching bills",
    });
  }
};

// View single bill details
exports.getBill = async (req, res) => {
  try {
    const bill = await billService.getBillDetails(req.params.billId);
    if (bill.renter._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this bill",
      });
    }
    return res.status(200).json({
      success: true,
      bill,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Error fetching bill",
    });
  }
};

// Verify and accept updated bill
exports.verifyBill = async (req, res) => {
  try {
    const bill = await billService.verifyBill(req.params.billId, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Bill verified successfully",
      bill,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error verifying bill",
    });
  }
};

// Pay bill online (Razorpay)
exports.payOnline = async (req, res) => {
  try {
    const bill = await billService.getBillDetails(req.params.billId);
    if (bill.renter._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Bill not found or doesn't belong to you",
      });
    }
    if (bill.status === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Bill is already paid",
      });
    }
    const order = await paymentService.createRazorpayOrder(bill);
    return res.status(200).json({
      success: true,
      message: "Payment order created",
      orderId: order.id,
      amount: bill.totalAmount,
      bill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating payment order",
    });
  }
};

// Verify and complete online payment
exports.verifyPayment = async (req, res) => {
  try {
    const { billId } = req.body;
    if (!billId) {
      return res.status(400).json({
        success: false,
        message: "Bill ID is required",
      });
    }
    const payment = await paymentService.verifyOnlinePayment(req.body, billId, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Payment successful",
      payment,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error processing payment",
    });
  }
};

// Mark bill as paid by cash
exports.payByCash = async (req, res) => {
  try {
    const payment = await paymentService.markBillAsPaidByCash(req.params.billId, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Cash payment marked. Waiting for landlord approval.",
      payment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error marking cash payment",
    });
  }
};

// Download invoice as PDF
exports.downloadInvoice = async (req, res) => {
  try {
    const pdfBuffer = await paymentService.generateInvoicePDF(req.params.billId, req.user.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice-${req.params.billId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error generating invoice",
    });
  }
};

// Search vacant rooms
exports.searchVacantRooms = async (req, res) => {
  try {
    const rooms = await roomService.searchVacantRooms(req.query);
    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error searching rooms",
    });
  }
};
