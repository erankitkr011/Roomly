const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    houseName: {
      type: String,
      required: false,
      trim: true,
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
    floorNo: {
      type: Number,
      required: true,
      min: 0,
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
    featues: {
      type: [String],
      default: [],
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
      default: null,
    },
    status: {
      type: String,
      enum: ["Vacant", "OccupiedVacant", "Occupied"],
      default: "Vacant",
    },
    // location: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },
    address: {
      houseNo: { type: String, trim: true },
      village: { type: String, trim: true },
      landmark: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },

    images: {
      type: [String],
      default: [],
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
roomSchema.index({ status: 1 });

module.exports = mongoose.model("Room", roomSchema);
