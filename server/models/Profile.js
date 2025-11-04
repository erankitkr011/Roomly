const mongoose = require('mongoose');

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
            unique: true,
        },
        aadharNo: {
            type: String,
            trim: true,
            unique: true,
        },
        aadharImage: {
            type: String,
            required: true,
        }
    }
);

module.exports = mongoose.model("Profile",profileSchema);