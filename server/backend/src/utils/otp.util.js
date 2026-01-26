import bcrypt from "bcrypt";
import smsClient from "../config/twilio.config.js";
// import mailTransporter from "../config/nodemailer.config.js";
import Otp from "../models/otp.model.js";
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

/* ------------------ HELPERS ------------------ */

const isEmail = (value) => /\S+@\S+\.\S+/.test(value);
const isPhone = (value) => /^\+\d{10,15}$/.test(value);

/* ------------------ OTP LOGIC ------------------ */

export const generateOtp = () =>
  Math.floor(
    Math.pow(10, OTP_LENGTH - 1) + Math.random() * Math.pow(10, OTP_LENGTH - 1),
  ).toString();

export const createOtp = async ({ userId, purpose }) => {
  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);

  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await Otp.create({ userId, otpHash, purpose, expiresAt });
  return otp;
};

export const verifyOtp = async ({ userId, purpose, inputOtp }) => {
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

/* ------------------ SEND OTP ------------------ */

export const sendOtp = async (destination, otp) => {
  try {
    if (isPhone(destination)) {
      console.log("phone no detected");
      smsClient.messages
        .create({
          body: `Your OTP is ${otp}. It expires in 5 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: destination,
        })
        .then((msg) => console.log("SMS sent:", msg.sid))
        .catch((err) => console.log("Twilio error:", err.message));
      return true;
    }
    //  else if (isEmail(destination)) {
    //   await mailTransporter.sendMail({
    //     from: process.env.EMAIL_USER,
    //     to: destination,
    //     subject: "Your Verification OTP",
    //     text: `Your OTP is ${otp}. It expires in 5 minutes.`,
    //   });
    //   return true;
    // }
    throw new Error("Invalid email or phone format");
  } catch (err) {
    console.error("OTP send failed:", err.message);
    throw new Error("Failed to send OTP");
  }
};
