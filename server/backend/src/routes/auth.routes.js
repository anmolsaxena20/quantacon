import express from "express";
import {
  signup,
  verifySignupOtp,
  login,
  oauthSuccess,
  refreshAccessToken,
} from "../controllers/auth.controller.js";
import passport from "../config/passport.config.js";
const router = express.Router();
router.post("/refresh", refreshAccessToken);
router.post("/signup", signup);
router.post("/verify-signup-otp", verifySignupOtp);
router.post("/login", login);
router.get(
  "/google",
  passport.authenticate("google-login", { scope: ["email", "profile"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google-login", {
    session: false,
    failureRedirect: "/auth/google/failure",
  }),
  oauthSuccess,
);
export default router;
