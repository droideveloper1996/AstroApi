const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  dob: {
    type: String,
    trim: true,
    required: false,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  gender: {
    type: String,
    trim: true,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  emailVerified: {
    type: Boolean,
    required: false,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("AstroUser", userSchema);
