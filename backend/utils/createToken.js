const jwt = require("jsonwebtoken");

// Generate Token
const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "3d",
  });

  // Set JWT as an HTTP-Only Cookie
  res.cookie("jwt", token, {
    httpOnly: true, //prevent XSS attack
    secure: process.env.NODE_ENV === "production", // prevents man-in-the-middle attacks
    sameSite: "strict", // prevent CSRF attack
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};

module.exports = { generateToken };
