const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  getUserNotifications,
  markNotificationAsRead,
  deleteNotification,
} = require("../controllers/notification.controller");

router.get("/", verifyToken, getUserNotifications);

router.put("/:id/read", verifyToken, markNotificationAsRead);

router.delete("/:id", verifyToken, deleteNotification);

module.exports = router;
