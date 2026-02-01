import Notification from "../models/notifications.model.js";
import { getSocketInstance } from "./socketInstance.util.js";

export const sendNotification = async ({
  recipient,
  sender,
  type,
  post = null,
  reel = null,
  comment = null,
  chat = null,
  message = "",
}) => {
  if (recipient.toString() === sender.toString()) return;
  const notification = await Notification.create({
    recipient,
    sender,
    type,
    post,
    reel,
    comment,
    chat,
    message,
  });

  const io = getSocketInstance();
  io.to(recipient.toString()).emit("notification", {
    id: notification._id,
    type,
    sender,
    post,
    reel,
    comment,
    chat,
    message,
    createdAt: notification.createdAt,
  });
};
