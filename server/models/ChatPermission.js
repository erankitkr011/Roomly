const mongoose = require("mongoose");

const chatPermissionSchema = new mongoose.Schema(
  {
    renter1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    renter2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    allowed: {
      type: Boolean,
      default: false,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      default: null,
    },
  },
  { timestamps: true }
);

// Ensure unique combination of renter1, renter2, and landlord
chatPermissionSchema.index({ renter1: 1, renter2: 1, landlord: 1 }, { unique: true });
chatPermissionSchema.index({ landlord: 1 });

module.exports = mongoose.model("ChatPermission", chatPermissionSchema);

