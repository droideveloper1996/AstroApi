const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedbackModel.js"); // Import the Feedback model
const AstroUser = require("../models/astroModel.js"); // Assuming AstroUser is the user model
const User = require("../models/UserModel.js"); // Assuming AstroUser is the user model

// Route to add feedback
router.post("/add-feedback", async (req, res) => {
  try {
    const { astrologerId, userId, rating, comment } = req.body;

    // Check if the astrologer and user exist
    const astrologer = await AstroUser.findById(astrologerId);
    const user = await User.findById(userId);

    if (!astrologer || !user) {
      return res.status(404).json({ message: "Astrologer or User not found." });
    }

    // Create a new feedback
    const feedback = new Feedback({
      astrologerId,
      userId,
      rating,
      comment,
    });

    // Save feedback to the database
    await feedback.save();

    res.status(201).json({
      message: "Feedback added successfully!",
      feedback,
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ message: "Error adding feedback", error });
  }
});

router.put("/update-feedback/:feedbackId", async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { rating, comment } = req.body;
    const { astrologerId, userId } = req.body; // Assuming these are passed in the request body

    // Check if the feedback exists
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    // Ensure the user updating the feedback is the one who provided it
    if (feedback.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only update your own feedback." });
    }

    // Validate the astrologer exists
    const astrologer = await AstroUser.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found." });
    }

    // Update feedback
    feedback.rating = rating || feedback.rating; // Update rating if provided
    feedback.comment = comment || feedback.comment; // Update comment if provided
    feedback.updatedAt = Date.now(); // Set the updated time

    // Save the updated feedback
    await feedback.save();

    res.status(200).json({
      message: "Feedback updated successfully!",
      feedback,
    });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ message: "Error updating feedback", error });
  }
});

router.delete("/delete-feedback/:feedbackId", async (req, res) => {
  try {
    const { feedbackId } = req.params;
    const { userId } = req.body; // Assuming the userId is passed in the body of the request

    // Check if the feedback exists
    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found." });
    }

    // Ensure the user deleting the feedback is the one who provided it
    if (feedback.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only delete your own feedback." });
    }

    // Delete the feedback
    await Feedback.findByIdAndDelete(feedbackId);

    res.status(200).json({
      message: "Feedback deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: "Error deleting feedback", error });
  }
});

module.exports = router;
