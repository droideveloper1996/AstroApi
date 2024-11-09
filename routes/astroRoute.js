// routes/astrologerRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const Astrologer = require("../models/astroModel");
const router = express.Router();
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();
const multer = require("multer");
const multerS3 = require("multer-s3");
console.log("Creds", {
  accessKeyId: process.env.AWS_SECRET_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});
AWS.config.update({
  accessKeyId: process.env.AWS_SECRET_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "ap-south-1",
});
// const s3 = new AWS.S3();
const { S3Client } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const s3 = new S3Client({
  region: process.env.AWS_REGION, // Replace with your AWS region
  credentials: {
    accessKeyId: process.env.AWS_SECRET_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
router.get("/getAllAstrologer", async (req, res) => {
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

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "output.questphysic.com",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(
        null,
        `profile-pictures/${Date.now().toString()}-${file.originalname}`
      );
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  "/upload-profile-picture/:userId",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { userId } = req.params;

      // Log req.file to check if the file was uploaded successfully
      console.log("Uploading file", req.file); // Check if req.file is defined

      if (!req.file) {
        return res
          .status(400)
          .json({ message: "File upload failed. Please try again." });
      }

      const fileUrl = req.file.location; // Should contain the URL from S3

      // Update the user's profile picture URL in MongoDB
      const user = await Astrologer.findByIdAndUpdate(
        userId,
        { profilePicture: fileUrl },
        { new: true }
      );

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({
        message: "Profile picture updated successfully",
        profilePictureUrl: user.profilePicture,
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      res
        .status(500)
        .json({ message: "Error uploading profile picture", error });
    }
  }
);

router.delete("/delete-account/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and delete the user by ID
    const user = await Astrologer.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ message: "Error deleting account", error });
  }
});

module.exports = router;
