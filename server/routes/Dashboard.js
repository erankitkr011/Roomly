const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const User = require("../models/User");
const Room = require("../models/Room");
const Bill = require("../models/Bill");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");

// Get dashboard stats
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const accountType = req.user.accountType;

    let stats = {};

    if (accountType === "Landlord") {
      const totalRooms = await Room.countDocuments({ landlord: userId });
      const occupiedRooms = await Room.countDocuments({
        landlord: userId,
        status: "Occupied",
      });
      const vacantRooms = await Room.countDocuments({
        landlord: userId,
        status: "Vacant",
      });
      const totalRenters = await Room.distinct("renter", {
        landlord: userId,
        renter: { $ne: null },
      }).then((renters) => renters.length);

      const pendingBills = await Bill.countDocuments({
        landlord: userId,
        status: "Pending",
      });
      const paidBills = await Bill.countDocuments({
        landlord: userId,
        status: "Paid",
      });

      const totalRevenue = await Payment.aggregate([
        {
          $match: {
            landlord: userId,
            status: "Successful",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amountPaid" },
          },
        },
      ]);

      stats = {
        totalRooms,
        occupiedRooms,
        vacantRooms,
        totalRenters,
        pendingBills,
        paidBills,
        totalRevenue: totalRevenue[0]?.total || 0,
      };
    } else if (accountType === "Renter") {
      const room = await Room.findOne({ renter: userId });
      const totalBills = await Bill.countDocuments({ renter: userId });
      const pendingBills = await Bill.countDocuments({
        renter: userId,
        status: "Pending",
      });
      const paidBills = await Bill.countDocuments({
        renter: userId,
        status: "Paid",
      });

      const totalPaid = await Payment.aggregate([
        {
          $match: {
            renter: userId,
            status: "Successful",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amountPaid" },
          },
        },
      ]);

      stats = {
        room: room
          ? {
              id: room._id,
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              pricePerMonth: room.pricePerMonth,
            }
          : null,
        totalBills,
        pendingBills,
        paidBills,
        totalPaid: totalPaid[0]?.total || 0,
      };
    }

    // Get unread notifications count
    const unreadNotifications = await Notification.countDocuments({
      receiver: userId,
      read: false,
    });

    stats.unreadNotifications = unreadNotifications;

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error fetching dashboard stats",
    });
  }
});

module.exports = router;

