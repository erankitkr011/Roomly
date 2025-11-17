const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true, // Every payment belongs to a bill
    },
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    mode: {
      type: String,
      enum: ["Online", "Cash"],
      default: "Cash",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Card", "Razorpay", "Other"],
      default: "Cash",
    },
    transactionId: {
      type: String,
      default: null, // Optional if UPI or online payment used
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Processing", "Successful", "Failed"],
      default: "Processing",
    },
    invoiceUrl: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-update bill status when payment is successful
paymentSchema.post("save", async function (doc, next) {
  try {
    if (doc.status === "Successful") {
      await mongoose
        .model("Bill")
        .findByIdAndUpdate(doc.bill, { status: "Paid" });
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Common indexes for queries
paymentSchema.index({ renter: 1 });
paymentSchema.index({ landlord: 1 });
paymentSchema.index({ bill: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
