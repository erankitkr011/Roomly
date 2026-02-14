const chatService = require("../services/chatService");

// Get all chats for logged in user
exports.getMyChats = async (req, res) => {
  try {
    const chats = await chatService.getMyChats(req.user.id);
    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching chats",
    });
  }
};
// Send message to renter (Landlord)
exports.sendMessageToRenter = async (req, res) => {
  try {
    const { renterId } = req.params;
    const { content, messageType } = req.body;
    const landlordId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    await chatService.verifyRenterOwnership(renterId, landlordId);
    const chat = await chatService.findOrCreateLandlordRenterChat(landlordId, renterId);
    await chatService.sendMessage(chat._id, landlordId, content, messageType);
    await chatService.notifyNewMessage(landlordId, renterId);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      chat,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error sending message",
    });
  }
};

// Get chat history with renter (Landlord)
exports.getChatWithRenter = async (req, res) => {
  try {
    const { renterId } = req.params;
    const landlordId = req.user.id;

    const chat = await chatService.findOrCreateLandlordRenterChat(landlordId, renterId);
    const result = await chatService.getChatHistory(chat._id);

    if (!result) {
      return res.status(200).json({
        success: true,
        message: "No chat history found",
        chat: null,
        messages: [],
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching chat",
    });
  }
};

// Send message to landlord (Renter)
exports.sendMessageToLandlord = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const { content, messageType } = req.body;
    const renterId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    await chatService.verifyRenterOwnership(renterId, landlordId);
    const chat = await chatService.findOrCreateLandlordRenterChat(landlordId, renterId);
    await chatService.sendMessage(chat._id, renterId, content, messageType);
    await chatService.notifyNewMessage(renterId, landlordId);

    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      chat,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error sending message",
    });
  }
};

// Get chat history with landlord (Renter)
exports.getChatWithLandlord = async (req, res) => {
  try {
    const { landlordId } = req.params;
    const renterId = req.user.id;

    const chat = await chatService.findOrCreateLandlordRenterChat(landlordId, renterId);
    const result = await chatService.getChatHistory(chat._id);

    if (!result) {
      return res.status(200).json({
        success: true,
        message: "No chat history found",
        chat: null,
        messages: [],
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching chat",
    });
  }
};

// Enable renter-to-renter chat (Landlord)
exports.enableRenterChat = async (req, res) => {
  try {
    const { renter1Id, renter2Id } = req.body;
    const result = await chatService.enableRenterChat(renter1Id, renter2Id, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Renter-to-renter chat enabled",
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Error enabling chat",
    });
  }
};

// Disable renter-to-renter chat (Landlord)
exports.disableRenterChat = async (req, res) => {
  try {
    const { renter1Id, renter2Id } = req.body;
    await chatService.disableRenterChat(renter1Id, renter2Id, req.user.id);
    return res.status(200).json({
      success: true,
      message: "Renter-to-renter chat disabled",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message || "Error disabling chat",
    });
  }
};

// Send message to other renter (Renter)
exports.sendMessageToOtherRenter = async (req, res) => {
  try {
    const { renterId } = req.params;
    const { content, messageType } = req.body;
    const senderId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const Room = require("../models/Room");
    const senderRoom = await Room.findOne({ renter: senderId });
    if (!senderRoom) {
      return res.status(403).json({
        success: false,
        message: "You are not allocated to any room",
      });
    }

    const permission = await chatService.getRenterChatPermission(senderId, renterId, senderRoom.landlord);
    if (!permission) {
      return res.status(403).json({
        success: false,
        message: "Chat is not enabled between you and this renter",
      });
    }

    await chatService.sendMessage(permission.chatId, senderId, content, messageType);
    await chatService.notifyNewMessage(senderId, renterId);

    const chat = await chatService.getChatHistory(permission.chatId);
    return res.status(200).json({
      success: true,
      message: "Message sent successfully",
      ...chat,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: error.message || "Error sending message",
    });
  }
};

// Get chat history with other renter (Renter)
exports.getChatWithOtherRenter = async (req, res) => {
  try {
    const { renterId } = req.params;
    const currentRenterId = req.user.id;

    const Room = require("../models/Room");
    const room = await Room.findOne({ renter: currentRenterId });
    if (!room) {
      return res.status(403).json({
        success: false,
        message: "You are not allocated to any room",
      });
    }

    const permission = await chatService.getRenterChatPermission(currentRenterId, renterId, room.landlord);
    if (!permission || !permission.chatId) {
      return res.status(403).json({
        success: false,
        message: "Chat is not enabled",
      });
    }

    const result = await chatService.getChatHistory(permission.chatId);
    if (!result || !result.chat.isActive) {
      return res.status(403).json({
        success: false,
        message: "Chat is not active",
      });
    }

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching chat",
    });
  }
};
