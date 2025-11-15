const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/auth.middleware");
const {
  getFeedPosts,
  createPost,
  deletePost,
  getPostById,
  createComment,
  deleteComment,
  likePost,
} = require("../controllers/post.controller");

router.get("/", verifyToken, getFeedPosts);
router.post("/create", verifyToken, createPost);
router.delete("/delete/:id", verifyToken, deletePost);
router.get("/:id", verifyToken, getPostById);
router.post("/:id/comment", verifyToken, createComment);
router.delete("/:id/delete/:commentId", verifyToken, deleteComment);
router.post("/:id/like", verifyToken, likePost);

module.exports = router;
