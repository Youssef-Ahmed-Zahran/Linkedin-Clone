const { User } = require("../models/user.model");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/createToken");

/**
 *   @desc   Register New User
 *   @route  /api/v1/auth/signup
 *   @method  POST
 *   @access  public
 */
const register = asyncHandler(async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!username || !email || !password || !name) {
      return res.status(400).json({ message: "Please fill all the inputs." });
    }

    // Check both email and username in parallel
    const [existingEmail, existingUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);

    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists." });
    }

    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await user.save();

    generateToken(res, user._id);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Login User
 *   @route  /api/v1/auth/login
 *   @method  POST
 *   @access  public
 */
const login = asyncHandler(async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Please fill all the inputs." });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    generateToken(res, user._id);

    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 *   @desc   Logout User
 *   @route  /api/v1/auth/logout
 *   @method  POST
 *   @access  public
 */
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("jwt");
  res.status(200).json({ message: "Logged out successfully." });
});

/**
 *   @desc   Get Current User
 *   @route  /api/users/me
 *   @method  GET
 *   @access  private (authenticated user)
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in get current user", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
};
