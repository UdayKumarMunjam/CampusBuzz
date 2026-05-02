import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

// Load env
dotenv.config();

// DB
import connectDB from "./config/database.js";

// Routes
import lostFoundRoute from "./routes/lostfoundRoute.js";
import userRoute from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";
import postRoute from "./routes/postRoute.js";
import eventRoute from "./routes/eventRoute.js";
import activityRoute from "./routes/activityRoute.js";
import noticeRoute from "./routes/noticeRoute.js";
import placementRoute from "./routes/placementRoute.js";
import messageRoute from "./routes/messageRoute.js";

const app = express();
const server = createServer(app);

// ================= DATABASE =================
connectDB();

// ================= CONFIG =================
const PORT = process.env.PORT || 8080;

// ================= CORS FIX =================
const allowedOrigins = [
  "http://localhost:5173",
  "https://campus-buzz-jade.vercel.app",
  "https://campus-buzz-gr717zcgz-munjamudaykumar-2771s-projects.vercel.app",
  "https://campus-buzz-8mejq8fc7-munjamudaykumar-2771s-projects.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ VERY IMPORTANT (fix preflight error)
app.options("*", cors());

// ================= MIDDLEWARE =================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ================= ROUTES =================
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/posts", postRoute);
app.use("/api/events", eventRoute);
app.use("/api/activities", activityRoute);
app.use("/api/lostfound", lostFoundRoute);
app.use("/api/notices", noticeRoute);
app.use("/api/placements", placementRoute);
app.use("/api/messages", messageRoute);

// ================= SOCKET.IO =================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, receiverId, content } = data;
      const { Message } = await import("./models/messageSchema.js");

      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content: content.trim()
      });

      await message.populate("sender", "name avatar");
      await message.populate("receiver", "name avatar");

      io.to(receiverId).emit("receiveMessage", message);

    } catch (error) {
      console.error("Socket sendMessage error:", error);
    }
  });

  socket.on("deleteMessage", async (data) => {
    try {
      const { messageId, userId } = data;
      const { Message } = await import("./models/messageSchema.js");

      const message = await Message.findById(messageId);
      if (!message) return;

      await Message.findByIdAndDelete(messageId);

      io.to(userId).emit("messageDeleted", messageId);

    } catch (error) {
      console.error("Socket deleteMessage error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// ================= START SERVER =================
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});