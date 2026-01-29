import express from "express";
import upload from "../middlewares/upload.middleware.js";
import {
  logout,
  getUserDetails,
  updatePassword,
  updateProfilePicture,
  updateBasicInfo,
  requestPasswordOtp,
} from "../controllers/user.controller.js";
const router = express.Router();
router.post("/logout", logout);
router.get("/me", getUserDetails);
router.put("/me", updateBasicInfo);
router.put("/profile", upload.single("media"), updateProfilePicture);
router.post("/request-otp", requestPasswordOtp);
router.post("/update-password", updatePassword);
export default router;
