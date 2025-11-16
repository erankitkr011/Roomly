const Chat = require("../models/Chat");
const ChatPermission = require("../models/ChatPermission");
const Room = require("../models/Room");
const User = require("../models/User");
const Notification = require("../models/Notification");

/**
 * Find or create landlord-renter chat
 */
exports.findOrCreateLandlordRenterChat = async (landlordId, renterId) => {
  let chat = await Chat.findOne({
    participants: { $all: [landlordId, renterId] },
    chatType: "landlord-renter",
    isActive: true,
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [landlordId, renterId],
      messages: [],
      chatType: "landlord-renter",
      landlord: landlordId,
      isActive: true,
    });
  }

  return chat;
};

/**
 * Send message to chat
 */
exports.sendMessage = async (chatId, senderId, content, messageType = "text") => {
  const chat = await Chat.findById(chatId);
  if (!chat || !chat.isActive) {
    throw new Error("Chat not found or not active");
  }

  chat.messages.push({
    sender: senderId,
    content,
    messageType,
    isRead: false,
    createdAt: new Date(),
  });

  await chat.save();
  return chat;
};

/**
 * Get chat history
 */
exports.getChatHistory = async (chatId, populateFields = true) => {
  let query = Chat.findById(chatId);
  
  if (populateFields) {
    query = query.populate("participants", "firstName lastName email image");
  }

  const chat = await query.sort({ "messages.createdAt": -1 });

  if (!chat) {
    return null;
  }

  return {
    chat,
    messages: chat.messages.reverse(),
  };
};

/**
 * Verify renter belongs to landlord
 */
exports.verifyRenterOwnership = async (renterId, landlordId) => {
  const room = await Room.findOne({ landlord: landlordId, renter: renterId });
  if (!room) {
    throw new Error("This renter is not under your management");
  }
  return true;
};

/**
 * Enable renter-to-renter chat
 */
exports.enableRenterChat = async (renter1Id, renter2Id, landlordId) => {
  if (renter1Id === renter2Id) {
    throw new Error("Cannot enable chat with same renter");
  }

  const room1 = await Room.findOne({ landlord: landlordId, renter: renter1Id });
  const room2 = await Room.findOne({ landlord: landlordId, renter: renter2Id });

  if (!room1 || !room2) {
    throw new Error("Both renters must be under your management");
  }

  let permission = await ChatPermission.findOne({
    renter1: { $in: [renter1Id, renter2Id] },
    renter2: { $in: [renter1Id, renter2Id] },
    landlord: landlordId,
  });

  if (permission && permission.allowed) {
    throw new Error("Chat is already enabled between these renters");
  }

  let chat = await Chat.findOne({
    participants: { $all: [renter1Id, renter2Id] },
    chatType: "renter-renter",
    landlord: landlordId,
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [renter1Id, renter2Id],
      messages: [],
      chatType: "renter-renter",
      landlord: landlordId,
      isActive: true,
    });
  }

  if (permission) {
    permission.allowed = true;
    permission.chatId = chat._id;
    await permission.save();
  } else {
    permission = await ChatPermission.create({
      renter1: renter1Id,
      renter2: renter2Id,
      landlord: landlordId,
      allowed: true,
      chatId: chat._id,
    });
  }

  return { permission, chat };
};

/**
 * Disable renter-to-renter chat
 */
exports.disableRenterChat = async (renter1Id, renter2Id, landlordId) => {
  const permission = await ChatPermission.findOne({
    renter1: { $in: [renter1Id, renter2Id] },
    renter2: { $in: [renter1Id, renter2Id] },
    landlord: landlordId,
  });

  if (!permission) {
    throw new Error("Chat permission not found");
  }

  permission.allowed = false;
  await permission.save();

  if (permission.chatId) {
    await Chat.findByIdAndUpdate(permission.chatId, { isActive: false });
  }

  return { success: true };
};

/**
 * Get renter chat permission
 */
exports.getRenterChatPermission = async (renter1Id, renter2Id, landlordId) => {
  const permission = await ChatPermission.findOne({
    renter1: { $in: [renter1Id, renter2Id] },
    renter2: { $in: [renter1Id, renter2Id] },
    landlord: landlordId,
    allowed: true,
  });

  return permission;
};

/**
 * Send notification for new message
 */
exports.notifyNewMessage = async (senderId, receiverId, messageType = "Chat") => {
  await Notification.create({
    sender: senderId,
    receiver: receiverId,
    message: `New message from ${messageType === "Chat" ? "user" : "renter"}`,
    type: messageType,
  });
};

