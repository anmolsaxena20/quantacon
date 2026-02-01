import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Reel from "../models/reel.model.js";
import Comment from "../models/comment.model.js";
import { sendNotification } from "../utils/notification.util.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.util.js";
import { getSocketInstance } from "../utils/socketInstance.util.js";
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
    const upload = await uploadToCloudinary(file.buffer, "reels");
    const reel = await Reel.create({
      author: req.user.id,
      videoUrl: upload.secure_url,
      caption,
    });
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
    const name = await User.findById(userId).select("name");

    await User.findByIdAndUpdate(userId, {
      $addToSet: { following: targetId },
    });
    await User.findByIdAndUpdate(targetId, {
      $addToSet: { followers: userId },
    });
    await sendNotification({
      recipient: targetId,
      sender: userId,
      type: "FOLLOW",
      message: "started following you",
    });
    const updates = {};
    if (targetUser.followers.length >= 500 && !targetUser.isVerifiedUser) {
      await User.findByIdAndUpdate(targetId, { isVerifiedUser: true });
      updates.isVerifiedUser = true;
    }
    res.json({ message: "Followed successfully", ...updates });
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
    else {
      await sendNotification({
        recipient: post.author,
        sender: userId,
        type: "LIKE",
        post: post._id,
        message: "liked your post",
      });
      post.likes.push(userId);
    }

    await post.save();

    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const toggleLikeReel = async (req, res) => {
  try {
    const userId = req.user.id;
    const reel = await Reel.findById(req.params.reelId);
    if (!reel) return res.status(404).json({ message: "Post not found" });

    const liked = reel.likes.includes(userId);

    if (liked) reel.likes.pull(userId);
    else {
      reel.likes.push(userId);
      await sendNotification({
        recipient: reel.author,
        sender: req.user.id,
        type: "LIKE",
        reel: reel._id,
        message: "liked your reel",
      });
    }
    await reel.save();
    res.json({ likes: reel.likes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const addCommentPost = async (req, res) => {
  try {
    const { text, parentComment } = req.body;

    const comment = await Comment.create({
      targetId: req.params.postId,
      targetModel: "Post",
      author: req.user.id,
      text,
      parentComment: parentComment || null,
    });
    await comment.populate("author", "name picture");
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      await sendNotification({
        recipient: parent.author,
        sender: req.user.id,
        type: "COMMENT",
        post: req.params.postId,
        comment: comment._id,
        message: "replied to your comment",
      });
    } else {
      const post = await Post.findById(req.params.postId);
      await sendNotification({
        recipient: post.author,
        sender: req.user.id,
        type: "COMMENT",
        post: req.params.postId,
        comment: comment._id,
        message: "commented on your post",
      });
      await Post.findByIdAndUpdate(req.params.postId, {
        $inc: { commentCount: 1 },
      });
    }
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const addCommentReel = async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    const comment = await Comment.create({
      targetId: req.params.reelId,
      targetModel: "Reel",
      author: req.user.id,
      text,
      parentComment: parentComment || null,
    });
    await comment.populate("author", "name picture");
    if (parentComment) {
      const parent = await Comment.findById(parentComment);

      await sendNotification({
        recipient: parent.author,
        sender: req.user.id,
        type: "COMMENT",
        reel: req.params.reelId,
        comment: comment._id,
        message: "replied to your comment",
      });
    } else {
      const reel = await Reel.findById(req.params.reelId);

      await sendNotification({
        recipient: reel.author,
        sender: req.user.id,
        type: "COMMENT",
        reel: req.params.reelId,
        comment: comment._id,
        message: "commented on your reel",
      });

      await Reel.findByIdAndUpdate(req.params.reelId, {
        $inc: { commentCount: 1 },
      });
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getPostLikes = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const post = await Post.findById(req.params.postId).populate({
      path: "likes",
      select: "name picture",
      options: { limit: Number(limit) },
    });

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post.likes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getReelLikes = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const reel = await Reel.findById(req.params.reelId).populate({
      path: "likes",
      select: "name picture",
      options: { limit: Number(limit) },
    });

    if (!reel) return res.status(404).json({ message: "Reel not found" });

    res.status(200).json(reel.likes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getPostComments = async (req, res) => {
  try {
    const { limit = 20, parentComment } = req.query;

    const filter = {
      targetId: req.params.postId,
      targetModel: "Post",
      parentComment: parentComment || null,
    };

    const comments = await Comment.find(filter)
      .populate("author", "name picture")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getReelComments = async (req, res) => {
  try {
    const { limit = 20, parentComment } = req.query;

    const filter = {
      targetId: req.params.reelId,
      targetModel: "Reel",
      parentComment: parentComment || null,
    };

    const comments = await Comment.find(filter)
      .populate("author", "name picture")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.status(200).json(comments);
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
      .populate("author", "name picture isVerifiedUser")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export const getReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate("author", "name picture isVerifiedUser")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(reels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
