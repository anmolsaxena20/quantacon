import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hash.util.js";
import { createOtp, verifyOtp, sendOtp } from "../utils/otp.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util.js";

/* -------------------- SIGNUP -------------------- */
export const signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password || (!email && !phone)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      authProvider: "local",
      isVerified: false,
    });

    const otp = await createOtp({ userId: user._id, purpose: "signup" });
    await sendOtp(email || phone, otp);

    res.json({ message: "OTP sent for verification", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ---------------- VERIFY SIGNUP OTP ---------------- */
export const verifySignupOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    await verifyOtp({ userId, purpose: "signup", inputOtp: otp });

    await User.findByIdAndUpdate(userId, { isVerified: true });

    res.json({ message: "Account verified successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* -------------------- LOGIN -------------------- */
export const login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;

    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: "Missing credentials" });
    }

    const user = await User.findOne({ $or: [{ email }, { phone }] });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your account first" });
    }

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken({ id: user._id });
    const refreshToken = generateRefreshToken({ id: user._id });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        tier: user.tier,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
