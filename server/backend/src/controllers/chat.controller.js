import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.util.js";
export const getAllChatsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({
      members: userId,
    })
      .populate("members", "name picture")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "name picture",
        },
      })
      .sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    res.status(500).json({ message: "Failed to load chats" });
  }
};
export const createChat = async (req, res) => {
  try {
    const { chatName, members } = req.body;
    const creatorId = req.user.id;

    if (!chatName) {
      return res.status(400).json({ message: "Group name is required" });
    }

    if (!members || members.length < 1) {
      return res.status(400).json({ message: "At least 1 member required" });
    }
    const uniqueMembers = [...new Set([...members, creatorId])];
    const groupChat = await Chat.create({
      isGroupChat: true,
      chatName,
      members: uniqueMembers,
      groupAdmins: [creatorId],
    });
    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("members", "name picture")
      .populate("groupAdmins", "name picture");
    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error("Create group chat error:", error);
    res.status(500).json({ message: "Failed to create group chat" });
  }
};

export const getPreviousMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 20 } = req.query;
    const userId = req.user.id;
    const chat = await Chat.findById(chatId).select("members");
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    const isMember = chat.members.some(
      (member) => member.toString() === userId,
    );
    if (!isMember) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const messages = await Message.find({ chatId })
      .populate("sender", "name picture")
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to load messages" });
  }
};
export const makeGroupChatAdmin = async (req, res) => {
  try {
    const { chatId, userIdToPromote } = req.body;
    const requesterId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroupChat) {
      return res.status(404).json({ message: "Group chat not found" });
    }
    const isRequesterAdmin = chat.groupAdmins.some(
      (admin) => admin.toString() === requesterId,
    );

    if (!isRequesterAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can promote members" });
    }
    const isMember = chat.members.some(
      (member) => member.toString() === userIdToPromote,
    );

    if (!isMember) {
      return res.status(400).json({ message: "User is not in this group" });
    }
    const alreadyAdmin = chat.groupAdmins.some(
      (admin) => admin.toString() === userIdToPromote,
    );

    if (alreadyAdmin) {
      return res.status(400).json({ message: "User is already an admin" });
    }

    chat.groupAdmins.push(userIdToPromote);
    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate("members", "name picture")
      .populate("groupAdmins", "name picture");

    res.status(200).json(updatedChat);
  } catch (error) {
    console.error("Make admin error:", error);
    res.status(500).json({ message: "Failed to update admin" });
  }
};
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }
    const result = await uploadToCloudinary(req.file.buffer, "chat_media");
    res.status(200).json({
      url: result.secure_url,
      publicId: result.public_id,
      type: result.resource_type,
      size: result.bytes,
      duration: result.duration || null,
    });
  } catch (error) {
    console.error("Chat media upload error:", error);
    res.status(500).json({ message: "Media upload failed" });
  }
};

export const createPrivateChat = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    if (receiverId === senderId) {
      return res
        .status(400)
        .json({ message: "Cannot start chat with yourself" });
    }
    let chat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [senderId, receiverId], $size: 2 },
    }).populate("members", "name picture");

    if (chat) {
      return res.status(200).json(chat);
    }
    chat = await Chat.create({
      isGroupChat: false,
      members: [senderId, receiverId],
    });
    const fullChat = await Chat.findById(chat._id).populate(
      "members",
      "name picture",
    );

    res.status(201).json(fullChat);
  } catch (error) {
    console.error("Create private chat error:", error);
    res.status(500).json({ message: "Failed to create chat" });
  }
};

export const leaveGroup = async (req, res) => {};
export const addMember = async (req, res) => {};
export const removeMember = async (req, res) => {};
