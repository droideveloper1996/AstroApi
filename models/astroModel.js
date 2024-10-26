// models/Astrologer.js
const mongoose = require("mongoose");

const astrologerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  specialization: {
    type: [String], // Change to an array of strings for multiple specializations
    required: true,
    trim: true,
  },
  experience: {
    type: Number,
    required: true, // Number of years of experience
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  ratings: {
    type: [Number], // Array of ratings from clients
    default: [],
  },
  totalClients: {
    type: Number,
    default: 0, // Default to 0 clients
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to calculate average rating
astrologerSchema.methods.getAverageRating = function () {
  if (this.ratings.length === 0) return 0;
  const total = this.ratings.reduce((acc, rating) => acc + rating, 0);
  return (total / this.ratings.length).toFixed(1); // Returns the average rating
};

module.exports = mongoose.model("Astrologer", astrologerSchema);
