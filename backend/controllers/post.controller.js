const { Post } = require("../models/post.model");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../lib/cloudinary");
const { Notification } = require("../models/notification.model");

// Http Methods / Verbs

/**
 *   @desc   Get Feed Posts
 *   @route  /api/v1/posts
 *   @method  GET
 *   @access  public
 */
const getFeedPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await Post.find({
      author: { $in: [...req.user.connections, req.user._id] },
    })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .populate({
        path: "sharedPost",
        populate: {
          path: "author",
          select: "name username profilePicture headline",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getFeedPosts controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Create Post
 *   @route  /api/v1/posts/create
 *   @method  POST
 *   @access  public
 */
const createPost = asyncHandler(async (req, res) => {
  try {
    const { content, image } = req.body;

    let newPost;

    if (image) {
      const imgResult = await cloudinary.uploader.upload(image);
      newPost = new Post({
        author: req.user._id,
        content,
        image: imgResult.secure_url,
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content,
      });
    }

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error("Error in createPost controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Delete Post
 *   @route  /api/v1/posts/delete/:id
 *   @method  DELETE
 *   @access  public
 */
const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found!" });
    }

    // check if the current user is the author of the post
    if (post.author._id.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post!" });
    }

    // USE PROMISE.ALL HERE - delete image and post at the same time!
    const deletePromises = [Post.findByIdAndDelete(postId)];

    if (post.image) {
      deletePromises.push(
        cloudinary.uploader.destroy(post.image.split("/").pop().split(".")[0])
      );
    }

    await Promise.all(deletePromises);

    res.status(200).json({ message: "Post deleted successfully!" });
  } catch (error) {
    console.error("Error in deletePost controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Get Post By Id
 *   @route  /api/v1/posts/:id
 *   @method  GET
 *   @access  public
 */
const getPostById = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name username headline profilePicture");

    if (!post) {
      return res.status(404).json({ error: "Post not found!" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in getPostById controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Create Comment
 *   @route  /api/v1/posts/:id/comment
 *   @method  POST
 *   @access  public
 */
const createComment = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found!" });
    }

    const createdCommentPost = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { user: userId, content } },
      },
      { new: true }
    ).populate("author", "name email username headline profilePicture");

    // Save notification without blocking response
    if (post.author._id.toString() !== userId.toString()) {
      const newNotification = new Notification({
        recipient: createdCommentPost.author,
        type: "comment",
        relatedUser: userId,
        relatedPost: postId,
      });

      // Fire and forget (faster response)
      newNotification
        .save()
        .catch((err) =>
          console.error("Error saving notification create comment:", err)
        );
      // TODO: When you add email, include it here too
    }

    res.status(200).json(createdCommentPost);
  } catch (error) {
    console.error("Error in createComment controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Delete Comment
 *   @route  /api/v1/posts/:id/delete/comment
 *   @method  DELETE
 *   @access  public
 */
const deleteComment = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const commentId = req.params.commentId;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found!" });
    }

    // Find the comment to verify ownership
    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ error: "Comment not found!" });
    }

    // Check if the user owns the comment
    if (comment.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own comments!" });
    }

    // Delete the specific comment by _id
    const deletedCommentPost = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: { comments: { _id: commentId } },
      },
      { new: true }
    );

    res.status(200).json(deletedCommentPost);
  } catch (error) {
    console.error("Error in deleteComment controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Like Post
 *   @route  /api/v1/posts/:id/like
 *   @method  POST
 *   @access  public
 */
const likePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    let post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: "Post not found!" });
    }

    if (post.likes.includes(userId)) {
      // unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // like the post
      post.likes.push(userId);

      // create a notification if the post owner is not the user who liked
      if (post.author._id.toString() !== userId.toString()) {
        const newNotification = new Notification({
          recipient: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });

        // Fire and forget (faster response)
        newNotification
          .save()
          .catch((err) =>
            console.error("Error saving notification like post:", err)
          );
      }
    }

    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in likePost controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Share Post
 *   @route  /api/v1/posts/:id/share
 *   @method  POST
 *   @access  public
 */
const sharePost = asyncHandler(async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const { content } = req.body; // Optional message when sharing

    // Find the original post
    const originalPost = await Post.findById(postId).populate(
      "author",
      "name username profilePicture headline"
    );

    if (!originalPost) {
      return res.status(404).json({ error: "Post not found!" });
    }

    // Create and save the new post
    const sharedPost = new Post({
      author: userId,
      content: content || "",
      sharedPost: postId,
    });

    await sharedPost.save();

    // Populate the shared post
    const populatedSharedPost = await Post.findById(sharedPost._id)
      .populate("author", "name username profilePicture headline")
      .populate({
        path: "sharedPost",
        select: "content image createdAt likes comments",
        populate: {
          path: "author",
          select: "name username profilePicture headline",
        },
      });

    // Create a notification ONLY if the original post author is NOT the current user
    if (originalPost.author._id.toString() !== userId.toString()) {
      const newNotification = new Notification({
        recipient: originalPost.author._id,
        type: "share",
        relatedUser: userId,
        relatedPost: postId,
      });

      // Fire and forget (faster response)
      newNotification
        .save()
        .catch((err) =>
          console.error("Error saving notification share post:", err)
        );
    }

    res.status(201).json(populatedSharedPost);
  } catch (error) {
    console.error("Error in sharePost controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = {
  getFeedPosts,
  createPost,
  deletePost,
  getPostById,
  createComment,
  deleteComment,
  likePost,
  sharePost,
};
