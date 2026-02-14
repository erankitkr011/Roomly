const mongoose = require("mongoose");

const removalRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    handledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

removalRequestSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model("RemovalRequest", removalRequestSchema);
