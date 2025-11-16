const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["Bill", "Payment", "System", "Reminder", "Alert", "Chat"],
      default: "System",
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: null, // Optional link to related resource
    },
  },
  { timestamps: true }
);

notificationSchema.index({ receiver: 1, read: 1 });
notificationSchema.index({ sender: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
