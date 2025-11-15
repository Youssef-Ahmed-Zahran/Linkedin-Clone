const { Notification } = require("../models/notification.model");
const asyncHandler = require("express-async-handler");

// Http Methods / Verbs

/**
 *   @desc   Get User Notifications
 *   @route  /api/v1/notifications
 *   @method  GET
 *   @access  public
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "image content")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error in getUserNotifications controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Mark Notification As Read
 *   @route  /api/v1/notifications/:id/read
 *   @method  GET
 *   @access  public
 */
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  try {
    let notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found!" });
    }

    notification = await Notification.findByIdAndUpdate(
      {
        _id: notificationId,
        recipient: req.user._id,
      },
      { read: true },
      { new: true }
    );

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error in markNotificationAsRead controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Delete Notification
 *   @route  /api/v1/notifications/:id
 *   @method  GET
 *   @access  public
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  try {
    let notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found!" });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ message: "Notification deleted successfully!" });
  } catch (error) {
    console.error("Error in deleteNotification controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
};
