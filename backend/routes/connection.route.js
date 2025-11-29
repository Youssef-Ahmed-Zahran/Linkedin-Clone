const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getConnectionRequests,
  getUserConnections,
  removeConnection,
  getConnectionStatus,
} = require("../controllers/connection.controller");

router.post("/request/:userId", verifyToken, sendConnectionRequest);
router.put("/accept/:requestId", verifyToken, acceptConnectionRequest);
router.put("/reject/:requestId", verifyToken, rejectConnectionRequest);

// Get all connection requests for the current user
router.get("/requests", verifyToken, getConnectionRequests);
// Get all connections for a user
router.get("/", verifyToken, getUserConnections);

router.delete("/:userId", verifyToken, removeConnection);
router.get("/status/:userId", verifyToken, getConnectionStatus);

module.exports = router;
