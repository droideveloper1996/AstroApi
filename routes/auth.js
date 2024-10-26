// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const User = require("../models/UserModel");
const axios = require("axios");
// const sendOtp = () => {
//   axios
//     .post("https://graph.facebook.com/v19.0/385326414665455/messages", data, {
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`, // Replace with your actual token
//       },
//     })
//     .then((response) => {
//       console.log("Success:", response.data);
//     })
//     .catch((error) => {
//       console.error(
//         "Error:",
//         error.response ? error.response.data : error.message
//       );
//     });
// };

const sendOtpMessage = async (mobile, otp) => {
  try {
    const response = await axios.post(
      "https://graph.facebook.com/v19.0/371997922668450/messages",
      {
        messaging_product: "whatsapp",
        to: mobile,
        type: "template",
        template: {
          name: "basic_otp_message",
          language: {
            code: "en_US",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: "Verify",
                },
              ],
            },
          ],
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer EAAOQSkUUTVIBO2Ik5zKtqhxpHyOlQBZBEmfp67R5qU70NenyXWESZC6gjycBAjaA0qMR3oZACtmmN0QKJ0BaWzuqtoYU7a5qSNettwQNQvxVbkSezw7BvAZAJjUAbyUq2X64YE0v2n6yqpp5op4E1iQJ4fJ76wfh6t8DB0wk0D562ubAVe93QNwwaMjdBm69ZCQZDZD",
        },
      }
    );

    console.log("OTP message sent successfully:", response.data);
  } catch (error) {
    console.error(
      "Failed to send OTP message:",
      error.response?.data || error.message
    );
  }
};

// Utility function to generate OTP
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Endpoint to send OTP
router.post("/send-otp", async (req, res) => {
  const { mobileNumber } = req.body;
  console.log(mobileNumber);
  // Generate OTP and set expiry
  const otp = generateOtp();
  await sendOtpMessage(mobileNumber, otp);
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  try {
    let user = await User.findOne({ mobileNumber });

    if (!user) {
      user = new User({ mobileNumber, otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
    }

    await user.save();

    // Here, you would integrate an SMS service to send the OTP
    console.log(`OTP sent to ${mobileNumber}: ${otp}`);
    res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error sending OTP" });
  }
});

// Endpoint to verify OTP
router.post("/verify-otp", async (req, res) => {
  const { mobileNumber, otp } = req.body;

  try {
    const user = await User.findOne({ mobileNumber, otp });

    if (!user) return res.status(400).json({ message: "Invalid OTP" });
    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    // OTP verified successfully; clear OTP from the user record
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Send token or session for authenticated user (e.g., JWT)
    res.status(200).json({ message: "OTP verified successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

module.exports = router;
