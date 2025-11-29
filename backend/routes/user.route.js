const express = require("express");
const router = express.Router();
const {
  getSuggestedConnections,
  getPublicProfile,
  updateCurrentUser,
  getUserProfile,
} = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/suggestions", verifyToken, getSuggestedConnections);
router.get("/:username", verifyToken, getPublicProfile);
router.put("/profile", verifyToken, updateCurrentUser);

router.get("/profile/:query", verifyToken, getUserProfile);

module.exports = router;
