const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    totalFloors: {
      type: Number,
      default: 0,
      min: 0,
    },
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

houseSchema.index({ landlord: 1 });

module.exports = mongoose.model("House", houseSchema);
