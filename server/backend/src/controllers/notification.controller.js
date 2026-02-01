import User from "../models/user.model.js";
import Notification from "../models/notificationModel.js";

export const getPreviousNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit } = req.query;
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate("sender", "name picture");
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};
