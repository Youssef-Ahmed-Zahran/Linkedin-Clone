const express = require("express");
const router = express.Router();
const {
  getSuggestedConnections,
  getPublicProfile,
  updateCurrentUser,
} = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/suggestions", verifyToken, getSuggestedConnections);
router.get("/:username", verifyToken, getPublicProfile);
router.put("/profile", verifyToken, updateCurrentUser);

module.exports = router;
