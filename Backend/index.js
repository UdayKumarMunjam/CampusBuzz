import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import lostFoundRoute from './routes/lostfoundRoute.js';
import userRoute from './routes/userRoute.js';
import adminRoute from './routes/adminRoute.js';
import postRoute from './routes/postRoute.js';
import eventRoute from './routes/eventRoute.js'; // ✅ import events route
import activityRoute from './routes/activityRoute.js'; // ✅ import activities route
import noticeRoute from "./routes/noticeRoute.js";
import placementRoute from "./routes/placementRoute.js";
import messageRoute from "./routes/messageRoute.js";
dotenv.config({ path: '.env' });
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});
const PORT = process.env.PORT || 8080;

connectDB();

app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Routes
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/posts', postRoute);
app.use('/api/events', eventRoute); // ✅ add events route
app.use('/api/activities', activityRoute); // ✅ add activities route
app.use('/api/lostfound', lostFoundRoute);
app.use("/api/notices", noticeRoute);
app.use("/api/placements", placementRoute);
// Socket.IO connection handling
io.on('connection', (socket) => {
  // console.log('Socket connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId) => {
    socket.join(userId);
    // console.log(`User ${userId} joined their personal room`);
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      const { senderId, receiverId, content } = data;

      // Import Message model
      const { Message } = await import('./models/messageSchema.js');

      // Save message to database
      const message = await Message.create({
        sender: senderId,
        receiver: receiverId,
        content: content.trim()
      });

      // Populate sender and receiver details
      await message.populate('sender', 'name avatar');
      await message.populate('receiver', 'name avatar');

      // Emit to receiver only (sender already has the message via HTTP)
      io.to(receiverId).emit('receiveMessage', message);

    } catch (error) {
      console.error('Socket sendMessage error:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  // Handle message deletion
  socket.on('deleteMessage', async (data) => {
    try {
      const { messageId, userId } = data;

      const { Message } = await import('./models/messageSchema.js');
      const message = await Message.findById(messageId);

      // If message doesn't exist, it might have been deleted via HTTP already
      // This is not an error - just emit the deletion event
      if (!message) {
        // Notify the user that the message was deleted (even if it was already gone)
        io.to(userId).emit('messageDeleted', messageId);
        return;
      }

      // Check permissions if message still exists
      if (message.sender.toString() !== userId && message.receiver.toString() !== userId) {
        socket.emit('deleteError', { error: 'You can only delete messages in conversations you are part of' });
        return;
      }

      // Delete the message if it still exists
      await Message.findByIdAndDelete(messageId);

      // Notify both sender and receiver
      io.to(message.sender.toString()).emit('messageDeleted', messageId);
      io.to(message.receiver.toString()).emit('messageDeleted', messageId);

    } catch (error) {
      console.error('Socket deleteMessage error:', error);
      socket.emit('deleteError', { error: 'Failed to delete message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use("/api/messages", messageRoute);
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
