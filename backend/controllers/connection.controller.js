const { connectionRequest } = require("../models/connectionRequest.model");
const { Notification } = require("../models/notification.model");
const { User } = require("../models/user.model");
const asyncHandler = require("express-async-handler");

// Http Methods / Verbs

/**
 *   @desc   Send Connection Request
 *   @route  /api/v1/connections/request/:userId
 *   @method  POST
 *   @access  public
 */
const sendConnectionRequest = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const senderId = req.user._id;

    if (senderId.toString() === userId) {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself" });
    }

    if (req.user.connections.includes(userId)) {
      return res.status(400).json({ message: "You are already connected" });
    }

    const existingRequest = await connectionRequest.findOne({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "A connection request already exists" });
    }

    const newRequest = new connectionRequest({
      sender: senderId,
      recipient: userId,
    });

    await newRequest.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error in sendConnectionRequest controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Accept Connection Request
 *   @route  /api/v1/connections/accept/:requestId
 *   @method  PUT
 *   @access  public
 */
const acceptConnectionRequest = asyncHandler(async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await connectionRequest
      .findById(requestId)
      .populate("sender", "name email username")
      .populate("recipient", "name username");

    if (!request) {
      return res.status(400).json({ message: "Request not found!" });
    }

    // check if the req is for the current user
    if (request.recipient._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    request.status = "accepted";

    // Run all 4 operations in parallel!
    await Promise.all([
      request.save(),
      User.findByIdAndUpdate(request.sender._id, {
        $addToSet: { connections: userId },
      }),

      User.findByIdAndUpdate(userId, {
        $addToSet: { connections: request.sender._id },
      }),

      new Notification({
        recipient: request.sender._id,
        type: "connectionAccepted",
        relatedUser: userId,
      }).save(),
    ]);

    res.status(200).json(request);
    // TODO: send email
  } catch (error) {
    console.error("Error in acceptConnectionRequest controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Reject Connection Request
 *   @route  /api/v1/connections/reject/:requestId
 *   @method  PUT
 *   @access  public
 */
const rejectConnectionRequest = asyncHandler(async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await connectionRequest.findById(requestId);

    if (!request) {
      return res.status(400).json({ message: "Request not found!" });
    }

    // check if the req is for the current user
    if (request.recipient._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to accept this request" });
    }

    if (request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "This request has already been processed" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Connection request rejected" });
  } catch (error) {
    console.error("Error in rejectConnectionRequest controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Get Connection Request
 *   @route  /api/v1/connections/requests
 *   @method  GET
 *   @access  public
 */
const getConnectionRequests = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await connectionRequest
      .find({
        recipient: userId,
        status: "pending",
      })
      .populate("sender", "name username profilePicture headline Connections");

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getConnectionRequests controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Get User Connections
 *   @route  /api/v1/connections
 *   @method  GET
 *   @access  public
 */
const getUserConnections = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const userConnections = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );

    if (!userConnections) {
      return res.status(400).json({ message: "User not found!" });
    }

    res.status(200).json(userConnections);
  } catch (error) {
    console.error("Error in getUserConnections controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   remove Connection
 *   @route  /api/v1/connections/:userId
 *   @method  DELETE
 *   @access  public
 */
const removeConnection = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    await Promise.all([
      User.findByIdAndUpdate(currentUserId, {
        $pull: { connections: userId },
      }),
      User.findByIdAndUpdate(userId, {
        $pull: { connections: currentUserId },
      }),
    ]);

    res.json({ message: "Connection removed" });
  } catch (error) {
    console.error("Error in removeConnection controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Get Connection Status
 *   @route  /api/v1/connections/status/:userId
 *   @method  GET
 *   @access  public
 */
const getConnectionStatus = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = req.user;

    if (currentUser.connections.includes(userId)) {
      return res.json({ status: "connected" });
    }

    const pendingRequest = await connectionRequest.findOne({
      $or: [
        { sender: currentUserId, recipient: userId },
        { sender: userId, recipient: currentUserId },
      ],
      status: "pending",
    });

    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currentUserId.toString()) {
        return res.json({ status: "pending" });
      } else {
        return res.json({ status: "received", requestId: pendingRequest._id });
      }
    }

    // if no connection or pending req found
    res.json({ status: "not_connected" });
  } catch (error) {
    console.error("Error in getConnectionStatus controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  getUserConnections,
  removeConnection,
  getConnectionStatus,
};
