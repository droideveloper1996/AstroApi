const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  astrologerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Astrologer", // Assuming the astrologer is also a user in the same "AstroUser" model
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AstroUser", // User giving feedback
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    trim: true,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes on astrologerId and userId for faster queries
feedbackSchema.index({ astrologerId: 1, userId: 1 });

module.exports = mongoose.model("Feedback", feedbackSchema);
