const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const authRoutes = require("./routes/auth");
const astroRoutes = require("./routes/astroRoute.js");
const userRoutes = require("./routes/userRoute");
const feedbackRoutes = require("./routes/feedback.js");
const predictionRoutes = require("./routes/prediction.js");

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Could not connect to MongoDB:", error));

// Routesconst AWS = require('aws-sdk');

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/astro", astroRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/predictions", predictionRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
