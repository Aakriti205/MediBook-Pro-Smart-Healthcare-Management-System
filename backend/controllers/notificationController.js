const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
    res.json({ success: true, notifications, unread });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.markRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ success: true, message: "All marked as read" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: "Deleted" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
