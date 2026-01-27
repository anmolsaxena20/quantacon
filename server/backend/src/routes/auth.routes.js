import express from "express";
import {
  signup,
  verifySignupOtp,
  login,
  oauthSuccess,
} from "../controllers/auth.controller.js";
import passport from "../config/passport.config.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/login", login);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/auth/google/failure",
  }),
  oauthSuccess,
);
export default router;
