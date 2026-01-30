import express from "express";
import {
  getAllChatsByUser,
  createChat,
  getPreviousMessages,
  makeGroupChatAdmin,
  uploadMedia,
  leaveGroup,
  addMember,
  removeMember,
} from "../controllers/chat.controller.js";
import upload from "../middlewares/upload.middleware.js";
const router = express.Router();
router.get("/", getAllChatsByUser);
router.post("/create", createChat);
router.get("/:chatId", getPreviousMessages);
router.put("/make-admin", makeGroupChatAdmin);
router.post("/media", upload.single("media"), uploadMedia);
router.put("/group/leave", leaveGroup);
router.put("/group/add-member", addMember);
router.put("/group/remove-member", removeMember);
export default router;
