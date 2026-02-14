const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");
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

// Security middlewares
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(mongoSanitize());
app.use(hpp());

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: "Too many auth attempts, please try again later." },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many payment attempts, please try again later." },
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(globalLimiter);

// API routes
app.use("/api/v1/auth", authLimiter, authRoutes);
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

// Start server with Socket.IO
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Chat = require("./models/Chat");
const chatService = require("./services/chatService");

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Socket.IO JWT auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  // Join user to their own room for targeted notifications
  socket.join(`user-${socket.user.id}`);

  socket.on("join-chat", (chatId) => {
    socket.join(`chat-${chatId}`);
  });

  socket.on("leave-chat", (chatId) => {
    socket.leave(`chat-${chatId}`);
  });

  socket.on("send-message", async (data) => {
    try {
      const { chatId, content, messageType } = data;
      const chat = await Chat.findById(chatId);
      if (!chat || !chat.isActive) return;

      const message = {
        sender: socket.user.id,
        content,
        messageType: messageType || "text",
        isRead: false,
        createdAt: new Date(),
      };

      chat.messages.push(message);
      await chat.save();

      // Broadcast to all in the chat room
      io.to(`chat-${chatId}`).emit("new-message", {
        chatId,
        message: { ...message, _id: chat.messages[chat.messages.length - 1]._id },
      });
    } catch (err) {
      console.error("Socket send-message error:", err.message);
    }
  });

  socket.on("typing", (data) => {
    socket.to(`chat-${data.chatId}`).emit("user-typing", {
      chatId: data.chatId,
      userId: socket.user.id,
    });
  });

  socket.on("stop-typing", (data) => {
    socket.to(`chat-${data.chatId}`).emit("user-stop-typing", {
      chatId: data.chatId,
      userId: socket.user.id,
    });
  });

  socket.on("mark-read", async (data) => {
    try {
      const { chatId } = data;
      const count = await chatService.markAsRead(chatId, socket.user.id);
      if (count > 0) {
        // Notify chat room AND all participants via their user rooms
        const chat = await Chat.findById(chatId);
        const readEvent = { chatId, readBy: socket.user.id };
        io.to(`chat-${chatId}`).emit("messages-read", readEvent);
        if (chat?.participants) {
          chat.participants.forEach((pid) => {
            io.to(`user-${pid.toString()}`).emit("messages-read", readEvent);
          });
        }
      }
    } catch (err) {
      console.error("Socket mark-read error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, io, server };
