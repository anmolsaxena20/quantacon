import crypto from "crypto";
import razorpayInstance from "../config/razorpay.config.js";
import User from "../models/user.model.js";
import strict from "assert/strict";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util.js";

export const createOrder = async (req, res) => {
  try {
    console.log("order received");
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayInstance.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      plan,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { tier: "pro" },
      { new: true },
    );
    console.log("payment verified");
    const accessToken = generateAccessToken({
      id: user._id,
      tier: user.tier,
    });

    const refreshToken = generateRefreshToken({
      id: user._id,
      tier: user.tier,
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log("tier updated successfully");
    res.json({
      message: "Payment successful, tier upgraded",
      accessToken,
      user: { id: user._id, tier: user.tier },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
