import { Router } from "express";
import {
  register,
  verifyOtp,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
export default router;
