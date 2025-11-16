const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ], // Array of 2 users (landlord-renter or renter-renter)
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        messageType: {
          type: String,
          enum: ["text", "image", "file", "notice"],
          default: "text",
        },
        isRead: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    chatType: {
      type: String,
      enum: ["landlord-renter", "renter-renter"],
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // For renter-renter chats, this is the controlling landlord
    },
  },
  { timestamps: true }
);

chatSchema.index({ participants: 1 });
chatSchema.index({ landlord: 1 });
chatSchema.index({ isActive: 1 });

module.exports = mongoose.model("Chat", chatSchema);

