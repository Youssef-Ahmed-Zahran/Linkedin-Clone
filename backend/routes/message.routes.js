const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadMessagesCount,
} = require("../controllers/message.controller");

router.get("/conversations", verifyToken, getConversations);
router.get("/:otherUserId", verifyToken, getMessages);
router.post("/", verifyToken, sendMessage);

router.get("/unread/count", verifyToken, getUnreadMessagesCount);

module.exports = router;
