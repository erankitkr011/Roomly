const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const User = require("../models/User");
const House = require("../models/House");
const Room = require("../models/Room");
const Bill = require("../models/Bill");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");

// Get dashboard stats with dual roles
router.get("/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    let stats = {
      landlordStats: null,
      renterStats: null,
      unreadNotifications: 0,
    };

    // If user is a landlord, get landlord stats
    if (user.roles?.isLandlord) {
      const totalHouses = await House.countDocuments({ landlord: userId });
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
      const verifiedBills = await Bill.countDocuments({
        landlord: userId,
        status: "Verified",
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

      // Get houses with their occupancy
      const houses = await House.find({ landlord: userId })
        .select("name totalUnits occupiedUnits")
        .limit(5);

      stats.landlordStats = {
        totalHouses,
        totalRooms,
        occupiedRooms,
        vacantRooms,
        totalRenters,
        pendingBills,
        verifiedBills,
        paidBills,
        totalRevenue: totalRevenue[0]?.total || 0,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0,
        houses,
      };
    }

    // If user is a renter, get renter stats
    if (user.roles?.isRenter) {
      const room = await Room.findOne({ renter: userId })
        .populate("house", "name address")
        .populate("floor", "floorNumber floorName")
        .populate("landlord", "firstName lastName email contactNumber");

      const totalBills = await Bill.countDocuments({ renter: userId });
      const pendingBills = await Bill.countDocuments({
        renter: userId,
        status: { $in: ["Pending", "Verified"] },
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

      // Get recent bills
      const recentBills = await Bill.find({ renter: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("month totalAmount status createdAt");

      stats.renterStats = {
        room: room
          ? {
              id: room._id,
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              pricePerMonth: room.pricePerMonth,
              house: room.house,
              floor: room.floor,
              landlord: room.landlord,
            }
          : null,
        totalBills,
        pendingBills,
        paidBills,
        totalPaid: totalPaid[0]?.total || 0,
        recentBills,
      };
    }

    // Get unread notifications count
    stats.unreadNotifications = await Notification.countDocuments({
      receiver: userId,
      read: false,
    });

    return res.status(200).json({
      success: true,
      stats,
      userRoles: {
        isLandlord: user.roles?.isLandlord || false,
        isRenter: user.roles?.isRenter || false,
        accountType: user.accountType,
      },
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

