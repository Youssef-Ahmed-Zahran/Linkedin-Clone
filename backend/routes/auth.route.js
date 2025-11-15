const express = require("express");
const router = express.Router();
const {
  register,
  login,
  logout,
  getCurrentUser,
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.get("/me", verifyToken, getCurrentUser);

module.exports = router;
