import bcrypt from "bcrypt";
import Otp from "../models/Otp.js";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

export const generateOtp = () => {
  return Math.floor(
    Math.pow(10, OTP_LENGTH - 1) + Math.random() * Math.pow(10, OTP_LENGTH - 1),
  ).toString();
};

export const createOtp = async ({ userId, purpose }) => {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.create({
    userId,
    otpHash,
    purpose,
    expiresAt,
  });

  return otp;
};

export const verifyOtp = async ({ userId, purpose, inputOtp }) => {
  const otpDoc = await Otp.findOne({ userId, purpose });

  if (!otpDoc) {
    throw new Error("OTP not found or expired");
  }

  if (otpDoc.attempts >= MAX_ATTEMPTS) {
    await otpDoc.deleteOne();
    throw new Error("Too many invalid attempts");
  }

  const isValid = await bcrypt.compare(inputOtp, otpDoc.otpHash);

  if (!isValid) {
    otpDoc.attempts += 1;
    await otpDoc.save();
    throw new Error("Invalid OTP");
  }

  await otpDoc.deleteOne();
  return true;
};
