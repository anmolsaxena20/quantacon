import {
  findUserByEmail,
  findUserByPhone,
  createUser,
  createOtp,
  getLatestOtp,
  markOtpVerified,
  markUserActive,
  storeRefreshToken,
  findRefreshTokensByUser,
  deleteRefreshToken,
} from "../services/auth.db.js";

import {
  hashPassword,
  comparePassword,
  generateOtp,
  hashOtp,
  compareOtp,
  createAccessToken,
  createRefreshToken,
  hashRefreshToken,
  sendOtpSms,
  sendOtpEmail,
} from "../utils/auth.util.js";

import {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
} from "../validators/auth.validator.js";
import jwt from "jsonwebtoken";
// ---------- helpers ----------

function setRefreshCookie(res, token) {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
}

// ---------- REGISTER ----------

export async function register(req, res) {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, phoneNumber, password } = value;

    if (email && (await findUserByEmail(email))) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (phoneNumber && (await findUserByPhone(phoneNumber))) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await hashPassword(password);

    const user = await createUser({
      email,
      phoneNumber,
      passwordHash,
      status: "PENDING",
    });

    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    await createOtp({
      userId: user.id,
      identifier: email || phoneNumber,
      codeHash: otpHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    if (phoneNumber) {
      await sendOtpSms(phoneNumber, otp);
    } else {
      await sendOtpEmail(email, otp);
    }
    console.log("OTP:", otp);

    res.status(201).json({
      userId: user.id,
      message: "OTP sent",
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

// ---------- VERIFY OTP + AUTO LOGIN ----------

export async function verifyOtp(req, res) {
  try {
    const { error, value } = verifyOtpSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { userId, otp } = value;

    const record = await getLatestOtp(userId);
    if (!record) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    const valid = await compareOtp(otp, record.codeHash);
    if (!valid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await markOtpVerified(record.id);

    const identifierType = record.identifier.includes("@") ? "email" : "phone";

    const user = await markUserActive(userId, identifierType);

    const accessToken = createAccessToken({ userId: user.id });

    const refreshToken = createRefreshToken({ userId: user.id });
    const refreshTokenHash = await hashRefreshToken(refreshToken);

    await storeRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    setRefreshCookie(res, refreshToken);

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
}

// ---------- LOGIN ----------

export async function login(req, res) {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const { email, phoneNumber, password } = value;

    const user = email
      ? await findUserByEmail(email)
      : await findUserByPhone(phoneNumber);

    if (!user || user.status !== "ACTIVE") {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = createAccessToken({ userId: user.id });

    const refreshToken = crypto.randomUUID();
    const refreshTokenHash = await hashRefreshToken(refreshToken);

    await storeRefreshToken({
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    setRefreshCookie(res, refreshToken);

    res.json({ accessToken });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
}
export async function refresh(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = JSON.parse(
      Buffer.from(token.split(".")[1] || "", "base64").toString(),
    );

    const tokens = await findRefreshTokensByUser(payload.userId);

    let validToken = null;

    for (const t of tokens) {
      const match = await comparePassword(token, t.tokenHash);
      if (match) {
        validToken = t;
        break;
      }
    }

    if (!validToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const accessToken = createAccessToken({ userId: payload.userId });

    res.json({ accessToken });
  } catch {
    res.status(401).json({ message: "Invalid refresh token" });
  }
}
export async function logout(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.clearCookie("refreshToken").sendStatus(204);
    }
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const tokens = await findRefreshTokensByUser(payload.userId);

    for (const t of tokens) {
      const match = await comparePassword(token, t.tokenHash);
      if (match) {
        await deleteRefreshToken(t.id);
        break;
      }
    }

    res.clearCookie("refreshToken").sendStatus(204);
  } catch {
    res.clearCookie("refreshToken").sendStatus(204);
  }
}
