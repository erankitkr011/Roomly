const Notification = require("../models/Notification");
const Room = require("../models/Room");

/**
 * Create notification
 */
exports.createNotification = async (notificationData) => {
  const notification = await Notification.create(notificationData);
  return notification;
};

/**
 * Send notification to all renters of a landlord
 */
exports.sendNotificationToAllRenters = async (landlordId, message, title = null) => {
  const rooms = await Room.find({ landlord: landlordId, renter: { $ne: null } });
  const renterIds = [...new Set(rooms.map((room) => room.renter.toString()))];

  const notifications = renterIds.map((renterId) => ({
    sender: landlordId,
    receiver: renterId,
    message: title ? `${title}: ${message}` : message,
    type: "System",
  }));

  await Notification.insertMany(notifications);
  return renterIds.length;
};

/**
 * Get notifications for user
 */
exports.getUserNotifications = async (userId, limit = 50) => {
  const notifications = await Notification.find({ receiver: userId })
    .populate("sender", "firstName lastName email image")
    .sort({ createdAt: -1 })
    .limit(limit);

  return notifications;
};

/**
 * Mark notification as read
 */
exports.markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    receiver: userId,
  });

  if (!notification) {
    throw new Error("Notification not found");
  }

  notification.read = true;
  await notification.save();
  return notification;
};

