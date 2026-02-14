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
      const rooms = await Room.find({ renter: userId })
        .populate("house", "name address")
        .populate("floor", "floorNumber floorName")
        .populate("landlord", "firstName lastName email contactNumber");

      // Aggregate totals across all rooms
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

      // Get recent bills (across all rooms)
      const recentBills = await Bill.find({ renter: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("month totalAmount status createdAt room");

      // Build per-room stats
      const roomsWithStats = await Promise.all(
        rooms.map(async (room) => {
          const roomId = room._id;

          const roomTotalBills = await Bill.countDocuments({ renter: userId, room: roomId });
          const roomPendingBills = await Bill.countDocuments({
            renter: userId,
            room: roomId,
            status: { $in: ["Pending", "Verified"] },
          });
          const roomPaidBills = await Bill.countDocuments({
            renter: userId,
            room: roomId,
            status: "Paid",
          });

          const roomTotalPaid = await Payment.aggregate([
            {
              $match: {
                renter: userId,
                room: roomId,
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

          const roomRecentBills = await Bill.find({ renter: userId, room: roomId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("month totalAmount status createdAt");

          return {
            id: room._id,
            roomNumber: room.roomNumber,
            roomType: room.roomType,
            pricePerMonth: room.pricePerMonth,
            house: room.house,
            floor: room.floor,
            landlord: room.landlord,
            stats: {
              totalBills: roomTotalBills,
              pendingBills: roomPendingBills,
              paidBills: roomPaidBills,
              totalPaid: roomTotalPaid[0]?.total || 0,
              recentBills: roomRecentBills,
            },
          };
        })
      );

      stats.renterStats = {
        rooms: roomsWithStats,
        totalBills,
        pendingBills,
        paidBills,
        totalPaid: totalPaid[0]?.total || 0,
        recentBills,
      };
    }

    // Get unread notifications count
    stats.unreadNotifications = await Notification.countDocuments({
      targetTenants: userId,
      isReadBy: { $ne: userId },
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

