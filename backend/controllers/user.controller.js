const { User } = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const cloudinary = require("../lib/cloudinary");
const mongoose = require("mongoose");

// Http Methods / Verbs

/**
 *   @desc   Get Suggested Connections
 *   @route  /api/v1/user/suggestions
 *   @method  Get
 *   @access  public
 */
const getSuggestedConnections = asyncHandler(async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const currentUser = await User.findById(req.user._id).select("connections");

    // Get total count for hasMore calculation
    const totalCount = await User.countDocuments({
      _id: {
        $ne: req.user._id,
        $nin: currentUser.connections,
      },
    });

    // Find users with pagination
    const suggestedUsers = await User.find({
      _id: {
        $ne: req.user._id,
        $nin: currentUser.connections,
      },
    })
      .select("name username profilePicture headline")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      users: suggestedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalUsers: totalCount,
        hasMore: page < Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error in get suggested connections controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Get Public Profile
 *   @route  /api/v1/user/:username
 *   @method  Get
 *   @access  public
 */
const getPublicProfile = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error in get public profile controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

const serchUserProfile = async (req, res) => {
  // We will fetch user profile either with username or userId
  // query is either username or userId
  const { query } = req.params;

  try {
    let user;

    // query is userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      // query is username
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserProfile: ", err.message);
  }
};

/**
 *   @desc   Update User By Id
 *   @route  /api/users/profile
 *   @method  Put
 *   @access  private (User himself)
 */
const updateCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Whitelist allowed fields
    const allowedUpdates = [
      "name",
      "username",
      "headline",
      "about",
      "location",
      "profilePicture",
      "bannerImg",
      "skills",
      "experience",
      "education",
    ];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Handle password separately
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.password, salt);
    }

    // Upload images in parallel
    const uploadPromises = [];

    if (req.body.profilePicture) {
      uploadPromises.push(
        cloudinary.uploader.upload(req.body.profilePicture).then((result) => {
          updates.profilePicture = result.secure_url;
        })
      );
    }

    if (req.body.bannerImg) {
      uploadPromises.push(
        cloudinary.uploader.upload(req.body.bannerImg).then((result) => {
          updates.bannerImg = result.secure_url;
        })
      );
    }

    // Wait for all uploads to complete
    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error in update user controller:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = {
  getSuggestedConnections,
  getPublicProfile,
  updateCurrentUser,
  serchUserProfile,
};
