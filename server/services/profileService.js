const User = require("../models/User");

/**
 * Update user profile
 */
exports.updateProfile = async (userId, updates) => {
  const user = await User.findById(userId).populate("additionalDetails");
  if (!user) {
    throw new Error("User not found");
  }

  // Update user fields
  if (updates.firstName) user.firstName = updates.firstName;
  if (updates.lastName) user.lastName = updates.lastName;
  if (updates.middleName !== undefined) user.middleName = updates.middleName;

  // Update profile
  const profile = user.additionalDetails;
  if (updates.gender) profile.gender = updates.gender;
  if (updates.dateOfBirth) profile.dateOfBirth = updates.dateOfBirth;
  if (updates.about) profile.about = updates.about;
  if (updates.contactNumber) profile.contactNumber = updates.contactNumber;
  if (updates.aadharNo) profile.aadharNo = updates.aadharNo;
  if (updates.aadharImage) profile.aadharImage = updates.aadharImage;

  await profile.save();
  await user.save();

  return user;
};

