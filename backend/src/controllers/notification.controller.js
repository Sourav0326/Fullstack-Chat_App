import Notification from "../models/notification.model.js";

// Fetch all notifications for user
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  res.status(200).json(notifications);
};

// Delete a single notification
export const deleteNotification = async (req, res) => {
  await Notification.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  res.status(200).json({ message: "Notification deleted" });
};

// Clear all notifications
export const clearNotifications = async (req, res) => {
  await Notification.deleteMany({ userId: req.user._id });
  res.status(200).json({ message: "All notifications cleared" });
};
