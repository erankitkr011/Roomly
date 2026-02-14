const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    house: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "House",
      required: true,
    },
    floor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Floor",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    roomType: {
      type: String,
      enum: ["Room", "Flat", "Shop"],
      required: true,
    },
    pricePerMonth: {
      type: Number,
      required: true,
      min: 0,
    },
    perUnitRate: {
      type: Number, // e.g., ₹8 per unit
      required: true,
      default: 8,
    },
    features: {
      type: [String],
      default: [],
      trim: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["Vacant", "OccupiedVacant", "Occupied"],
      default: "Vacant",
    },
    images: {
      type: [String],
      default: [],
    },
    advanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentMeterReading: {
      type: Number,
      default: 0, // landlord sets this when assigning a new tenant
      min: 0,
    },
  },
  { timestamps: true }
);

roomSchema.index({ landlord: 1 });
roomSchema.index({ house: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ status: 1 });

module.exports = mongoose.model("Room", roomSchema);
