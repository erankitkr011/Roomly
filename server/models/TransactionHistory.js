const mongoose = require("mongoose");

const transactionHistorySchema = new mongoose.Schema(
  {
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true, // Link to the actual payment
    },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    house: { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ["Payment", "Refund", "Adjustment"],
      default: "Payment",
    },
    paymentMethod: {
      type: String,
      enum: ["Cash", "UPI", "Bank Transfer", "Card", "Other"],
      default: "Cash",
    },
    transactionId: {
      type: String,
      trim: true,
      default: null,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

transactionHistorySchema.index({ landlord: 1 });
transactionHistorySchema.index({ renter: 1 });
transactionHistorySchema.index({ bill: 1 });

module.exports = mongoose.model("TransactionHistory", transactionHistorySchema);
