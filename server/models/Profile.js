const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    about: {
      type: String,
    },
    contactNumber: {
      type: String,
      trim: true,
    },
    aadharNo: {
      type: String,
      trim: true,
    },
    aadharImage: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
