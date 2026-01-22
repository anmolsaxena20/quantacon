import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    purpose: {
      type: String,
      enum: ["signup", "login", "reset-password"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index
    },
  },
  {
    timestamps: true,
  },
);

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
