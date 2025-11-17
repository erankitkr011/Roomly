const mongoose = require("mongoose");

const floorSchema = new mongoose.Schema(
  {
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    floorNumber: {
      type: Number,
      required: true,
      min: 0,
    }, // 0 = Ground
    floorName: {
      type: String,
      trim: true,
    }, // "Ground", "1st"
    totalUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    occupiedUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Compound unique index: same floor number should not exist twice in the same house
floorSchema.index({ house: 1, floorNumber: 1 }, { unique: true });

module.exports = mongoose.model("Floor", floorSchema);
