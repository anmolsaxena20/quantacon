import express from "express";
import upload from "../middlewares/upload.middleware.js";
import {
  createPost,
  createReel,
  followUser,
  toggleLikePost,
  addCommentPost,
  addCommentReel,
  toggleLikeReel,
  getFeed,
  getReels,
  searchUsersByName,
  getPostLikes,
  getPostComments,
  getReelComments,
  getReelLikes,
} from "../controllers/social.controller.js";

const router = express.Router();

router.post("/post", upload.single("media"), createPost);
router.post("/reel", upload.single("media"), createReel);
router.post("/user", searchUsersByName);
router.get("/reels", getReels);
router.post("/follow/:id", followUser);
router.get("/feed", getFeed);
router.post("/like/post/:postId", toggleLikePost);
router.post("/like/reel/:reelId", toggleLikeReel);
router.post("/comment/post/:postId", addCommentPost);
router.post("/comment/reel/:reelId", addCommentReel);
router.get("/likes/post/:postId", getPostLikes);
router.get("/likes/reel/:reelId", getReelLikes);
router.get("/comments/post/:postId", getPostComments);
router.get("/comments/reel/:reelId", getReelComments);

export default router;
