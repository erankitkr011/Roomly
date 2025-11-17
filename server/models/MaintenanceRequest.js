const mongoose = require("mongoose");

const maintenanceRequestSchema = new mongoose.Schema(
  {
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
    house: { type: mongoose.Schema.Types.ObjectId, ref: "House", required: true },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    issueType: {
      type: String,
      enum: ["Electricity", "Plumbing", "Cleaning", "Appliance", "Other"],
      default: "Other",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null, // optional photo of issue
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

maintenanceRequestSchema.index({ landlord: 1 });
maintenanceRequestSchema.index({ renter: 1 });
maintenanceRequestSchema.index({ status: 1 });

module.exports = mongoose.model("MaintenanceRequest", maintenanceRequestSchema);
