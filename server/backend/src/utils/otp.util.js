import bcrypt from "bcrypt";
import mailTransporter from "../config/nodemailer.config.js";
import Otp from "../models/otp.model.js";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const generateOtp = () =>
  Math.floor(
    Math.pow(10, OTP_LENGTH - 1) + Math.random() * Math.pow(10, OTP_LENGTH - 1),
  ).toString();
export const createEmailOtp = async ({ userId, purpose }) => {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.create({
    userId,
    otpHash,
    purpose,
    expiresAt,
    attempts: 0,
  });

  return otp;
};
export const sendEmailOtp = async (email, otp) => {
  try {
    await mailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Verification OTP",
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      `,
    });

    return true;
  } catch (err) {
    console.error("Email OTP send error:", err.message);
    throw new Error("Failed to send email OTP");
  }
};
export const verifyEmailOtp = async ({ userId, purpose, inputOtp }) => {
  const otpDoc = await Otp.findOne({ userId, purpose }).sort({ createdAt: -1 });

  if (!otpDoc) throw new Error("OTP not found or expired");

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
