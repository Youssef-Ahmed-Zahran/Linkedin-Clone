const asyncHandler = require("express-async-handler");
const { Conversation } = require("../models/conversation.model");
const { Message } = require("../models/message.model");
const cloudinary = require("../lib/cloudinary");
const { getRecipientSocketId, io } = require("../lib/socket");

/**
 *   @desc   Send Messages
 *   @route  /api/v1/messages
 *   @method  POST
 *   @access  public
 */
const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { recipientId, message } = req.body;
    const senderId = req.user._id;
    let { img } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] },
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        lastMessage: {
          text: message,
          sender: senderId,
          img: img || "",
        },
      });
      await conversation.save();
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newMessage = new Message({
      conversationId: conversation._id,
      sender: senderId,
      text: message,
      img: img || "",
    });

    await Promise.all([
      newMessage.save(),
      conversation.updateOne({
        lastMessage: {
          text: message,
          sender: senderId,
          img: img || "",
        },
      }),
    ]);

    // Convert to plain object to include all fields
    const messageObject = newMessage.toObject();

    // Emit to recipient only (sender updates via API response)
    const recipientSocketId = getRecipientSocketId(recipientId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("newMessage", messageObject);
    }

    // Also emit to sender for conversation list update
    const senderSocketId = getRecipientSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", messageObject);
    }

    res.status(201).json(messageObject);
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Get Messages
 *   @route  /api/v1/messages/:otherUserId
 *   @method  GET
 *   @access  public
 */
const getMessages = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { otherUserId } = req.params;

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, otherUserId] },
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found 😥" });
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Get Conversations
 *   @route  /api/v1/messages/conversations
 *   @method  GET
 *   @access  public
 */
const getConversations = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: { $all: [userId] },
    })
      .sort({ updatedAt: -1 })
      .populate("participants", "name username profilePicture");

    // Filter out current user from participants
    const conversationsWithOtherUser = conversations.map((conversation) => {
      const conversationObj = conversation.toObject();
      conversationObj.participants = conversationObj.participants.filter(
        (participant) => participant._id.toString() !== userId.toString()
      );
      return conversationObj;
    });

    res.status(200).json(conversationsWithOtherUser);
  } catch (error) {
    console.error("Error in getConversations controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

const getUnreadMessagesCount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId,
    });

    let unreadCount = 0;

    // Count unread messages across all conversations
    for (const conversation of conversations) {
      const count = await Message.countDocuments({
        conversationId: conversation._id,
        sender: { $ne: userId }, // Not sent by current user
        seen: false, // Not seen
      });
      unreadCount += count;
    }

    res.status(200).json({ count: unreadCount });
  } catch (error) {
    console.error("Error in getUnreadMessagesCount:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadMessagesCount,
};
