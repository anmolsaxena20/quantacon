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
  (await notification.populate("sender", "name picture")).populate(
    "comment",
    "text",
  );
  const io = getSocketInstance();
  io.to(recipient.toString()).emit("notification", notification.toObject());
};
