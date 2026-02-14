const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const { auth } = require("../middlewares/auth");

// Get all notifications for logged-in user
// Notifications where user is in targetTenants OR is the sender
router.get("/", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      targetTenants: req.user.id,
    })
      .populate("sender", "firstName lastName email image")
      .sort({ createdAt: -1 })
      .limit(50);

    // Map to add a `read` field for convenience
    const mapped = notifications.map((n) => {
      const obj = n.toObject();
      obj.read = (n.isReadBy || []).some(
        (id) => id.toString() === req.user.id
      );
      return obj;
    });

    return res.status(200).json({
      success: true,
      count: mapped.length,
      notifications: mapped,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching notifications",
    });
  }
});

// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    // Add user to isReadBy if not already there
    if (!notification.isReadBy.includes(req.user.id)) {
      notification.isReadBy.push(req.user.id);
      await notification.save();
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error updating notification",
    });
  }
});

module.exports = router;
