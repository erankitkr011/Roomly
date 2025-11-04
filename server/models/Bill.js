const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
    },
    previousReading: {
      type: Number,
      required: false,
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
    status: {
      type: String,
      enum: ["Pending", "Verified", "Paid"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

//
// ─── BILL LOGIC ────────────────────────────────────────────────
//

// Before validation — calculate units and total
billSchema.pre("validate", async function (next) {
  try {
    const Room = mongoose.model("Room");
    const room = await Room.findById(this.room);

    if (!room) return next(new Error("Room not found"));

    // Auto-set previousReading if not provided
    if (this.isNew && (this.previousReading === undefined || this.previousReading === null)) {
      this.previousReading = room.currentMeterReading || 0;
    }

    // Prevent invalid readings
    if (this.currentReading < this.previousReading) {
      return next(new Error("Current reading cannot be less than previous reading"));
    }

    // Compute units consumed
    this.unitsConsumed = this.currentReading - this.previousReading;

    // Compute total: room rent + (units * rate)
    const rate = room.perUnitRate || 0;
    const rent = room.pricePerMonth || 0;
    this.totalAmount = rent + this.unitsConsumed * rate;

    next();
  } catch (err) {
    next(err);
  }
});

// After save — update room’s currentMeterReading for next cycle
billSchema.post("save", async function (doc, next) {
  try {
    await mongoose.model("Room").findByIdAndUpdate(doc.room, {
      currentMeterReading: doc.currentReading,
    });
    next();
  } catch (err) {
    next(err);
  }
});

// Indexes for quick lookups
billSchema.index({ landlord: 1 });
billSchema.index({ tenant: 1 });
billSchema.index({ status: 1 });
billSchema.index({ month: 1 });

module.exports = mongoose.model("Bill", billSchema);