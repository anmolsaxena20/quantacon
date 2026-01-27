import User from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hash.util.js";
import {
  createEmailOtp,
  sendEmailOtp,
  verifyEmailOtp,
} from "../utils/otp.util.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util.js";

export const signup = async (req, res) => {
  try {
    let { name, email, phone, password } = req.body;

    if (phone) phone = phone.trim();
    if (email) email = email.trim();
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
    const otp = await createEmailOtp({ userId: user._id, purpose: "signup" });
    await sendEmailOtp(email, otp);
    res.json({ message: "OTP sent for verification", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const verifySignupOtp = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    await verifyEmailOtp({ userId, purpose: "signup", inputOtp: otp });
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isVerified: true,
        lastLogin: new Date(),
      },
      { new: true },
    );
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

    res.json({
      accessToken,
      user: { id: user._id, name: user.name, tier: user.tier },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

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

    const accessToken = generateAccessToken({ id: user._id, tier: user.tier });
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

    res.json({
      accessToken,
      user: { id: user._id, name: user.name, tier: user.tier },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const oauthSuccess = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "OAuth failed" });
    }
    const accessToken = generateAccessToken({
      id: user._id,
      tier: user.tier,
    });
    const refreshToken = generateRefreshToken({
      id: user._id,
      tier: user.tier,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`http://localhost:5173/oauth-success?token=${accessToken}`);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "oauth handling failed" });
  }
};
