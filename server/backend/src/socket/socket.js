import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";
import "dotenv/config";
export const initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: process.env.CORS_ORIGIN.split(","), credentials: true },
  });
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) throw new Error("No token");
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User Connected");
    socket.on("join_chat", async ({ chatId }) => {
      const chat = await Chat.findById(chatId).select("members");
      if (!chat) return;
      const isMember = chat.members.some(
        (member) => member.toString() === socket.user.id,
      );

      if (!isMember) {
        console.log("Unauthorized room access attempt");
        return;
      }
      socket.join(chatId);
    });
    socket.on("send_message", async ({ chatId, content, messageType }) => {
      const chat = await Chat.findById(chatId).select("members");

      if (!chat) return;

      const isMember = chat.members.some(
        (member) => member.toString() === socket.user.id,
      );

      if (!isMember) return;

      const message = await Message.create({
        chatId,
        sender: socket.user.id,
        content: content,
        messageType: messageType,
      });
      io.to(chatId).emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {});
  });
  return io;
};
