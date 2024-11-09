const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const dotenv = require("dotenv");
dotenv.config();
router.put("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  const { name, email, dateOfBirth, gender, mobileNumber, profilePicture } =
    req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      { name, email, dateOfBirth, gender, mobileNumber, profilePicture },
      { new: true, runValidators: true } // `new: true` returns the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
});

module.exports = router;
