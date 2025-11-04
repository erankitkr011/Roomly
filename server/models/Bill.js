const mongoose = require("mongoose");
const Room = require("./Room");

const billSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true,
      trim: true,
    },
    previousReading: {
      type: Number,
      required: true,
      min: 0,
    },
    currentReading: {
      type: Number,
      required: true,
      min: 0,
    },
    unitsConsumed: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    meterImage: {
      type: String,
      default: null,
      trim: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// 🔁 Auto calculate before saving
billSchema.pre("validate", async function (next) {
  try {
    const room = await Room.findById(this.room);
    if (!room) return next(new Error("Associated room not found"));

    // Prevent invalid readings
    if (this.currentReading < this.previousReading) {
      return next(new Error("Current reading cannot be less than previous reading"));
    }

    // Compute units consumed
    this.unitsConsumed = this.currentReading - this.previousReading;

    // Calculate total (rent + electricity)
    this.totalAmount =
      room.pricePerMonth + this.unitsConsumed * room.perUnitRate;

    next();
  } catch (err) {
    next(err);
  }
});

// 📅 Auto set previousReading from last bill
billSchema.pre("validate", async function (next) {
  if (this.isNew && this.previousReading === undefined) {
    const lastBill = await mongoose.model("Bill").findOne({
      room: this.room,
      tenant: this.tenant,
    }).sort({ createdAt: -1 });

    if (lastBill) {
      this.previousReading = lastBill.currentReading;
    } else {
      const room = await Room.findById(this.room);
      this.previousReading = room?.currentMeterReading || 0;
    }
  }
  next();
});

billSchema.index({ landlord: 1 });
billSchema.index({ tenant: 1 });
billSchema.index({ status: 1 });

module.exports = mongoose.model("Bill", billSchema);
