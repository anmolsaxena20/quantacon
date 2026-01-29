import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import Comment from "../models/comment.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.util.js";
export const createPost = async (req, res) => {
  try {
    const file = req.file;
    const { caption } = req.body;

    const upload = await uploadToCloudinary(file.buffer, "posts");

    const post = await Post.create({
      author: req.user.id,
      caption,
      mediaUrl: upload.secure_url,
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const searchUsersByName = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }
    const users = await User.find({
      name: { $regex: `^${query}`, $options: "i" },
    })
      .select("-password -refreshToken")
      .limit(10);
    res.json({ users });
  } catch (err) {
    console.error("User search error:", err.message);
    res.status(500).json({ message: "Search failed" });
  }
};

export const createReel = async (req, res) => {
  try {
    const file = req.file;
    const { caption } = req.body;
    console.log("req.file", req.file);
    console.log("req.file", file);
    const upload = await uploadToCloudinary(file.buffer, "reels");
    console.log("upload", upload);
    const reel = await Reel.create({
      author: req.user.id,
      videoUrl: upload.secure_url,
      caption,
    });
    console.log("reel in backend", reel);
    res.json(reel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.id;

    if (userId === targetId) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: targetId },
    });
    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: userId },
    });

    res.json({ message: "Followed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const toggleLikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const post = await Post.findById(req.params.postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    const liked = post.likes.includes(userId);

    if (liked) post.likes.pull(userId);
    else post.likes.push(userId);

    await post.save();

    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      postId: req.params.postId,
      author: req.user.id,
      text: req.body.text,
    });

    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const posts = await Post.find({
      author: { $in: [...user.following, req.user.id] },
    })
      .populate("author", "name isVerifiedUser")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate("author", "name isVerifiedUser")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(reels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
