const axios = require("axios");
const express = require("express");
const router = express.Router();
const sharp = require("sharp");
// Middleware for parsing JSON requests
// Route to fetch the birth chart image
router.post("/fetch-birth-chart", async (req, res) => {
  try {
    const {
      birthDateTime,
      userId,
      version,
      language,
      tintColor,
      borderColor,
      borderWidth,
    } = req.body;

    // Validate required parameters
    if (!birthDateTime || !userId || !version || !language) {
      return res.status(400).json({
        message:
          "All parameters (birthDateTime, userId, version, language) are required",
      });
    }

    // Construct the date and time in the required format
    const { year, month, day, hour, minute } = birthDateTime;
    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}T${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    // Build the URL using the parameters
    const chartUrl = `https://files.prokerala.com/astrology/birth-chart/imgs/charts/${formattedDate}_${userId}_${version}_${language}.webp`;

    // Make an HTTP GET request to fetch the image
    const response = await axios.get(chartUrl, { responseType: "arraybuffer" });

    if (response.status === 200) {
      // Use sharp to get image metadata
      const image = sharp(response.data);
      const metadata = await image.metadata();

      const width = metadata.width;
      const height = metadata.height;

      if (!width || !height) {
        return res.status(400).json({
          message: "Could not retrieve image dimensions.",
        });
      }

      // Process the image with sharp
      let processedImage = image
        .extract({
          left: 10, // 10px from the left
          top: 10, // 10px from the top
          width: width - 20, // Subtract 10px from each side
          height: height - 50, // Subtract 10px from each side
        })
        .webp(); // Convert to webp format

      // Apply tint color if provided
      if (tintColor) {
        // Tint by modulating the hue, saturation, and lightness
        processedImage = processedImage.modulate({
          brightness: 1.2, // You can adjust the brightness as well
          saturation: 1.5, // Increase saturation to give a stronger tint effect
          hue: tintColor, // Tint color value (should be a number between -180 and 180 degrees)
        });
      }

      // Add border if provided
      if (borderColor && borderWidth) {
        processedImage = processedImage.extend({
          top: borderWidth,
          bottom: borderWidth,
          left: borderWidth,
          right: borderWidth,
          background: borderColor, // Border color (hex or named color)
        });
      }

      // Convert the image to a buffer
      const modifiedImage = await processedImage.toBuffer();

      // Send the cropped, tinted, and bordered image back as a response
      res.set("Content-Type", "image/webp");
      res.send(modifiedImage);
    } else {
      res.status(response.status).json({ message: "Failed to fetch image" });
    }
  } catch (error) {
    console.error(
      "Error fetching, cropping, tinting, and adding border to the birth chart image:",
      error
    );
    res.status(500).json({
      message: "Error processing the birth chart image",
      error: error.message,
    });
  }
});
module.exports = router;
