const express = require("express");
const conectToDB = require("./config/db");
const cookieParser = require("cookie-parser");
const { logger } = require("./middlewares/logger.middleware");
const { notFound, errorHanlder } = require("./middlewares/errors.middleware");
const helmet = require("helmet");
const cors = require("cors");
const { app, server } = require("./lib/socket");

// Load environment variables
require("dotenv").config();

// Connection To Database
conectToDB();

// Apply Middlewares
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger);
app.use(helmet());

// CORS Configuration
const corsOptions = {
  origin: [
    "http://localhost:5173",
    // TODO: Add your deployed frontend URL here after deployment
    // "https://your-frontend-app.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/api/v1/auth", require("./routes/auth.route"));
app.use("/api/v1/users", require("./routes/user.route"));
app.use("/api/v1/posts", require("./routes/post.route"));
app.use("/api/v1/notifications", require("./routes/notification.route"));
app.use("/api/v1/connections", require("./routes/connection.route"));
app.use("/api/v1/messages", require("./routes/message.routes"));

// Error Handler Middleware
app.use(notFound);
app.use(errorHanlder);

// Running the server
const PORT = process.env.PORT || 8080;

// Only start server if running directly (local development)
// On Vercel, this won't run because the file is imported as a module
if (require.main === module) {
  server.listen(PORT, () =>
    console.log(
      `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`
    )
  );
}

// Export app for Vercel serverless functions
module.exports = app;
