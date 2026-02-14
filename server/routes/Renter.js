const express = require("express");
const router = express.Router();
const {
  updateProfile,
  getAllBills,
  getBill,
  verifyBill,
  payOnline,
  verifyPayment,
  payByCash,
  downloadInvoice,
  searchVacantRooms,
} = require("../controllers/Renter");
const {
  getMyChats,
  sendMessageToLandlord,
  getChatWithLandlord,
  sendMessageToOtherRenter,
  getChatWithOtherRenter,
} = require("../controllers/Chat");
const { auth, isRenter } = require("../middlewares/auth");

// Search is open to any authenticated user (not just renters)
router.get("/search-vacant-room", auth, searchVacantRooms);

// Check if user already requested a specific room
router.get("/check-room-request/:roomId", auth, async (req, res) => {
    try {
        const Notification = require("../models/Notification");
        const existing = await Notification.findOne({
            sender: req.user.id,
            title: "Room Request",
            link: req.params.roomId,
        });
        return res.status(200).json({ success: true, requested: !!existing });
    } catch (error) {
        return res.status(400).json({ success: false, requested: false });
    }
});

// Room request — any authenticated user can request a room
router.post("/request-room", auth, async (req, res) => {
    try {
        const { landlordId, roomId } = req.body;
        const Room = require("../models/Room");
        const Notification = require("../models/Notification");
        const User = require("../models/User");

        const room = await Room.findById(roomId);
        if (!room || room.status !== "Vacant") {
            return res.status(400).json({ success: false, message: "Room is not available" });
        }

        // Prevent duplicate requests
        const existing = await Notification.findOne({
            sender: req.user.id,
            title: "Room Request",
            link: roomId,
        });
        if (existing) {
            return res.status(400).json({ success: false, message: "You have already requested this room" });
        }

        const requester = await User.findById(req.user.id);
        await Notification.create({
            sender: req.user.id,
            title: "Room Request",
            message: `${requester.firstName} ${requester.lastName} (${requester.email}) has requested ${room.roomType} #${room.roomNumber}`,
            type: "System",
            targetTenants: [landlordId],
            link: roomId,
        });

        return res.status(200).json({ success: true, message: "Request sent to landlord" });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || "Failed to request room" });
    }
});

// Accept room request — landlord accepts a renter's room request
router.post("/accept-room-request", auth, async (req, res) => {
    try {
        const { notificationId } = req.body;
        const Notification = require("../models/Notification");
        const Room = require("../models/Room");
        const User = require("../models/User");

        const notification = await Notification.findById(notificationId);
        if (!notification || notification.title !== "Room Request") {
            return res.status(400).json({ success: false, message: "Invalid room request" });
        }

        const roomId = notification.link;
        const requesterId = notification.sender;

        // Check room is still vacant
        const room = await Room.findById(roomId);
        if (!room || room.status !== "Vacant") {
            return res.status(400).json({ success: false, message: "Room is no longer available" });
        }

        // Allocate room to requester
        room.renter = requesterId;
        room.status = "Occupied";
        await room.save();

        // Set requester as renter
        await User.findByIdAndUpdate(requesterId, {
            "roles.isRenter": true,
        });

        // Update notification to indicate accepted
        notification.title = "Room Request Accepted";
        notification.message = notification.message.replace("has requested", "has been accepted for");
        await notification.save();

        // Notify the requester
        const landlord = await User.findById(req.user.id);
        await Notification.create({
            sender: req.user.id,
            title: "Request Accepted!",
            message: `${landlord.firstName} ${landlord.lastName} accepted your request for ${room.roomType} #${room.roomNumber}. You are now a renter!`,
            type: "System",
            targetTenants: [requesterId],
        });

        return res.status(200).json({ success: true, message: "Room request accepted! Renter allocated." });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || "Failed to accept request" });
    }
});

// Reject room request — landlord rejects with optional reason
router.post("/reject-room-request", auth, async (req, res) => {
    try {
        const { notificationId, reason } = req.body;
        const Notification = require("../models/Notification");
        const Room = require("../models/Room");
        const User = require("../models/User");

        const notification = await Notification.findById(notificationId);
        if (!notification || notification.title !== "Room Request") {
            return res.status(400).json({ success: false, message: "Invalid room request" });
        }

        const roomId = notification.link;
        const requesterId = notification.sender;
        const room = await Room.findById(roomId);
        const landlord = await User.findById(req.user.id);

        // Build rejection message
        const roomLabel = room ? `${room.roomType} #${room.roomNumber}` : "the room";
        let rejectMessage = `${landlord.firstName} ${landlord.lastName} rejected your request for ${roomLabel}.`;
        if (reason && reason.trim()) {
            rejectMessage += ` Reason: "${reason.trim()}"`;
        }
        rejectMessage += " You can request again if you'd like.";

        // Send rejection notification to renter
        await Notification.create({
            sender: req.user.id,
            title: "Request Rejected",
            message: rejectMessage,
            type: "System",
            targetTenants: [requesterId],
        });

        // Delete the original room request notification so renter can re-request
        await Notification.findByIdAndDelete(notificationId);

        return res.status(200).json({ success: true, message: "Room request rejected." });
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || "Failed to reject request" });
    }
});

// All remaining routes require authentication and renter role
router.use(auth, isRenter);

// Profile
router.put("/update-profile", updateProfile);

// Bills
router.get("/all-bills", getAllBills);
router.get("/bill/:billId", getBill);
router.post("/verify-bill/:billId", verifyBill);
router.post("/pay-online/:billId", payOnline);
router.post("/verify-payment", verifyPayment);
router.post("/pay-by-cash/:billId", payByCash);
router.get("/download-invoice/:billId", downloadInvoice);

// Chat
router.get("/my-chats", getMyChats);
router.post("/chat/:landlordId", sendMessageToLandlord);
router.get("/chat/:landlordId", getChatWithLandlord);
router.post("/chat-with-renter/:renterId", sendMessageToOtherRenter);
router.get("/chat-with-renter/:renterId", getChatWithOtherRenter);

module.exports = router;

