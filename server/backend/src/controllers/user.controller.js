import User from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.util.js";
import {
  sendEmailOtp,
  createEmailOtp,
  verifyEmailOtp,
} from "../utils/otp.util.js";
import { hashPassword } from "../utils/hash.util.js";
export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await User.findOneAndUpdate(
        { refreshToken },
        { $unset: { refreshToken: 1 } },
      );
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};
export const getUserDetails = async (req, res) => {
  try {
    const { id } = req.user;
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(id).select(
      "-password -picturePublicId -refreshToken",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("Get user details error:", err.message);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};
export const updateBasicInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, gender, dob } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (gender) updates.gender = gender;
    if (dob) {
      const dateOfBirth = new Date(dob);

      if (isNaN(dateOfBirth)) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      updates.dob = dateOfBirth;
    }
    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password -refreshToken");

    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};

export const updateProfilePicture = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "Image required" });
    }

    const user = await User.findById(userId);

    // delete old image if exists
    if (user.picturePublicId) {
      await deleteFromCloudinary(user.picturePublicId);
    }

    const upload = await uploadToCloudinary(req.file.path);

    user.picture = upload.secure_url;
    user.picturePublicId = upload.public_id;

    await user.save();

    res.json({ message: "Profile picture updated", picture: user.picture });
  } catch (err) {
    res.status(500).json({ message: "Image update failed" });
  }
};

export const requestPasswordOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const otp = await createEmailOtp({
      userId: user._id,
      purpose: "reset-password",
    });

    await sendEmailOtp(user.email, otp);

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    res.status(500).json({ message: "OTP request failed" });
  }
};
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp, newPassword } = req.body;

    await verifyEmailOtp({
      userId,
      purpose: "reset-password",
      inputOtp: otp,
    });

    const hashed = await hashPassword(newPassword);

    await User.findByIdAndUpdate(userId, { password: hashed });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
