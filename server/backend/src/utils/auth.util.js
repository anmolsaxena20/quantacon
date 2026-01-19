import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import twilio from "twilio";
import nodemailer from "nodemailer";

const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = "15m";

// ---------- Password ----------

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// ---------- OTP ----------

export async function sendOtpSms(phoneNumber, otp) {
  await twilioClient.messages.create({
    body: `Your verification code is ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber,
  });
}
export async function sendOtpEmail(email, otp) {
  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your verification code",
    text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
  });
}
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOtp(otp) {
  return bcrypt.hash(otp, SALT_ROUNDS);
}

export async function compareOtp(otp, hash) {
  return bcrypt.compare(otp, hash);
}

// ---------- Tokens ----------

export function createAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export async function hashRefreshToken(token) {
  return bcrypt.hash(token, SALT_ROUNDS);
}

export async function createRefreshToken(token) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}
