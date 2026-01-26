import express from "express";
import upload from "../middlewares/upload.middleware.js";
import {
  createPost,
  createReel,
  followUser,
  toggleLikePost,
  addComment,
  getFeed,
  getReels,
} from "../controllers/social.controller.js";

const router = express.Router();

router.post("/post", upload.single("media"), createPost);
router.post("/like/:postId", toggleLikePost);
router.post("/comment/:postId", addComment);
router.post("/reel", upload.single("media"), createReel);
router.get("/reels", getReels);
router.post("/follow/:id", followUser);
router.get("/feed", getFeed);

export default router;
