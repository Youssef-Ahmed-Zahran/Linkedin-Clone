const { User } = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const cloudinary = require("../lib/cloudinary");

// Http Methods / Verbs

/**
 *   @desc   Get Suggested Connections
 *   @route  /api/v1/user/suggestions
 *   @method  Get
 *   @access  public
 */
const getSuggestedConnections = asyncHandler(async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select("connections");

    // find users who are not already connected, and also do not recommend our own profile!!
    const suggestedUser = await User.find({
      _id: {
        $ne: req.user._id,
        $nin: currentUser.connections,
      },
    })
      .select("name username profilePicture headline")
      .limit(3);

    res.status(200).json(suggestedUser);
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

    // Hash password if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      req.body.profilePicture = result.secure_url;
    }

    if (req.body.bannerImg) {
      const result = await cloudinary.uploader.upload(req.body.bannerImg);
      req.body.bannerImg = result.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true } // runValidators is good for safety
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
};
