import { Message } from '../models/messageSchema.js';
import { User } from '../models/userSchema.js';

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all messages where user is either sender or receiver
    const userMessages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).populate('sender', 'name avatar role').populate('receiver', 'name avatar role');

    // Group messages by conversation (other participant)
    const conversationMap = new Map();

    userMessages.forEach(message => {
      const otherParticipantId = message.sender._id.toString() === userId.toString()
        ? message.receiver._id.toString()
        : message.sender._id.toString();

      const otherParticipant = message.sender._id.toString() === userId.toString()
        ? message.receiver
        : message.sender;

      if (!conversationMap.has(otherParticipantId)) {
        conversationMap.set(otherParticipantId, {
          id: otherParticipantId,
          participant: {
            _id: otherParticipant._id,
            name: otherParticipant.name,
            avatar: otherParticipant.avatar,
            role: otherParticipant.role
          },
          lastMessage: message.content,
          timestamp: message.createdAt,
          unreadCount: 0,
          messages: []
        });
      }

      // Update last message if this is more recent
      const existing = conversationMap.get(otherParticipantId);
      if (new Date(message.createdAt) > new Date(existing.timestamp)) {
        existing.lastMessage = message.content;
        existing.timestamp = message.createdAt;
      }

      // Count unread messages
      if (message.receiver._id.toString() === userId.toString() && !message.read) {
        existing.unreadCount += 1;
      }

      existing.messages.push(message);
    });

    // Convert map to array and sort by timestamp
    const conversations = Array.from(conversationMap.values()).sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return res.status(200).json({ conversations, success: true });
  } catch (error) {
    console.error('GetConversations error:', error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const { conversationId } = req.params;

    // Get all messages between user and conversation partner
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: conversationId },
        { sender: conversationId, receiver: userId }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: 1 });

    // Mark messages as read (messages sent to current user)
    await Message.updateMany(
      { sender: conversationId, receiver: userId, read: false },
      { read: true }
    );

    return res.status(200).json({ messages, success: true });
  } catch (error) {
    console.error('GetMessages error:', error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Receiver and content are required', success: false });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found', success: false });
    }

    // Create the message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim()
    });

    // Populate sender and receiver details
    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');

    return res.status(201).json({ message, success: true });
  } catch (error) {
    console.error('SendMessage error:', error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.params;

    // Find the message and ensure the user is the sender
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found', success: false });
    }

    // Allow both sender and receiver to delete messages (for better UX)
    if (message.sender.toString() !== userId.toString() && message.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only delete messages in conversations you are part of', success: false });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    return res.status(200).json({ message: 'Message deleted successfully', success: true });
  } catch (error) {
    console.error('DeleteMessage error:', error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};

// Get unread message count for user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Message.countDocuments({
      receiver: userId,
      read: false
    });

    return res.status(200).json({ unreadCount, success: true });
  } catch (error) {
    console.error('GetUnreadCount error:', error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};