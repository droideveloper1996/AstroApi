// routes/astrologerRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const Astrologer = require("../models/astroModel");

const router = express.Router();

// Register Astrologer
router.post("/register", async (req, res) => {
  const { name, specialization, experience, email, mobileNumber, password } =
    req.body;

  try {
    // Check if the astrologer already exists
    const existingAstrologer = await Astrologer.findOne({
      $or: [{ email }, { mobileNumber }],
    });
    if (existingAstrologer) {
      return res.status(400).json({
        message:
          "Astrologer already registered with this email or mobile number.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new astrologer
    const newAstrologer = new Astrologer({
      name,
      specialization, // Expecting specialization as an array
      experience,
      email,
      mobileNumber,
      password: hashedPassword,
    });

    await newAstrologer.save();

    res.status(201).json({
      message: "Astrologer registered successfully",
      astrologer: newAstrologer,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering astrologer", error: error.message });
  }
});

// routes/astrologerRoutes.js

// Update Ratings and Total Clients
router.post("/rate/:astrologerId", async (req, res) => {
  const { astrologerId } = req.params;
  const { rating } = req.body; // Expecting rating as a number

  try {
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found" });
    }

    // Add the rating and update total clients
    astrologer.ratings.push(rating);
    astrologer.totalClients += 1;

    await astrologer.save();

    res.status(200).json({
      message: "Rating added successfully",
      averageRating: astrologer.getAverageRating(),
      totalClients: astrologer.totalClients,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating rating", error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const astrologers = await Astrologer.find().select("-password"); // Exclude password from response
    res.status(200).json(astrologers);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching astrologers", error: error.message });
  }
});

// Get a specific astrologer by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const astrologer = await Astrologer.findById(id).select("-password"); // Exclude password from response
    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found" });
    }
    res.status(200).json(astrologer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching astrologer", error: error.message });
  }
});

module.exports = router;
