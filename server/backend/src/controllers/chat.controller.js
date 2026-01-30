import express from "express";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ members: userId })
      .populate("members", "name profilePic")
      .populate({
        path: "lastMessage",
        populate: { path: "sender", select: "name profilePic" },
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to load chats" });
  }
});
router.post("/private", async (req, res) => {
  try {
    const { receiverId } = req.body;
    const userId = req.user.id;

    let chat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [userId, receiverId], $size: 2 },
    });

    if (chat) return res.json(chat);
    chat = await Chat.create({
      isGroupChat: false,
      members: [userId, receiverId],
    });

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: "Failed to create chat" });
  }
});
router.get("/:chatId/messages", async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const chat = await Chat.findById(chatId);
    if (!chat.members.includes(req.user.id))
      return res.status(403).json({ message: "Unauthorized" });

    const messages = await Message.find({ chatId })
      .populate("sender", "name profilePic")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: "Failed to load messages" });
  }
});

export default router;
