const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expireAt: { type: Date, default: Date.now, index: { expires: 300 } } // 5 min
});

module.exports = mongoose.model("OTP", otpSchema);
