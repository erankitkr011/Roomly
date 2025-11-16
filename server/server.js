const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const { connectDB } = require("./config/database");

// Import routes
const authRoutes = require("./routes/Auth");
const landlordRoutes = require("./routes/Landlord");
const renterRoutes = require("./routes/Renter");
const adminRoutes = require("./routes/Admin");
const notificationRoutes = require("./routes/Notification");
const uploadRoutes = require("./routes/Upload");
const dashboardRoutes = require("./routes/Dashboard");

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/landlord", landlordRoutes);
app.use("/api/v1/renter", renterRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Health check route
app.get("/api/v1/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to Roomly API",
    version: "1.0.0",
  });
});

// 404 handler
app.use("*", (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  return res.status(500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;

