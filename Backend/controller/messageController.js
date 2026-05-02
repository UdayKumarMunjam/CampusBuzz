import { Message } from '../models/messageSchema.js';
import { User } from '../models/userSchema.js';
import cloudinary from '../config/cloudinary.js';

// Helper function to check if two users are connected
const areUsersConnected = async (userId1, userId2) => {
  try {
    const user1 = await User.findById(userId1).select('connections');
    if (!user1) return false;
    
    const connection = user1.connections.find(
      conn => conn.user.toString() === userId2.toString() && conn.status === 'connected'
    );
    
    return !!connection;
  } catch (error) {
    console.error('Error checking connection status:', error);
    return false;
  }
};

// Get all conversations for a user
export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('getConversations - userId:', userId);

    // Check if Message model is available
    if (!Message) {
      console.error('Message model is not available');
      return res.status(500).json({ message: 'Message model not found', success: false });
    }

    // Find all messages where user is either sender or receiver
    console.log('getConversations - Querying messages...');
    let userMessages;
    try {
      userMessages = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }]
      });
      console.log('getConversations - Raw messages found:', userMessages.length);
      
      // Now populate the references
      userMessages = await Message.populate(userMessages, [
        { path: 'sender', select: 'name avatar role' },
        { path: 'receiver', select: 'name avatar role' }
      ]);
    } catch (queryError) {
      console.error('Database query error:', queryError);
      throw queryError;
    }
    
    console.log('getConversations - Found messages:', userMessages.length);
    console.log('getConversations - Sample message:', userMessages[0] ? {
      id: userMessages[0]._id,
      sender: userMessages[0].sender?.name,
      receiver: userMessages[0].receiver?.name,
      content: userMessages[0].content?.substring(0, 50)
    } : 'No messages');

    // Group messages by conversation (other participant)
    const conversationMap = new Map();

    console.log('getConversations - Processing messages...');
    userMessages.forEach((message, index) => {
      try {
        // Skip messages where sender or receiver is null (deleted users)
        if (!message.sender || !message.receiver) {
          console.log(`Skipping message ${index} - null sender or receiver`);
          return;
        }

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
      } catch (messageError) {
        console.error(`Error processing message ${index}:`, messageError);
        console.error('Message data:', message);
      }
    });

    // Convert map to array and sort by timestamp
    const conversations = Array.from(conversationMap.values()).sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    console.log('getConversations - Returning conversations:', conversations.length);
    return res.status(200).json({ conversations, success: true });
  } catch (error) {
    console.error('GetConversations error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Server error', success: false, error: error.message });
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
    const { receiverId, content, images, sharedPost } = req.body;

    // Validate input - either content, images, or sharedPost must be provided
    if (!receiverId || (!content?.trim() && (!images || images.length === 0) && !sharedPost)) {
      return res.status(400).json({ 
        message: 'Receiver and either content, images, or shared post are required', 
        success: false 
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found', success: false });
    }

    // Check if users are connected
    const isConnected = await areUsersConnected(senderId, receiverId);
    if (!isConnected) {
      return res.status(403).json({ 
        message: 'You can only send messages to connected users', 
        success: false 
      });
    }

    let messageData = {
      sender: senderId,
      receiver: receiverId,
      content: content?.trim() || '',
      messageType: 'text',
      images: []
    };

    // Handle image uploads if provided
    if (images && images.length > 0) {
      try {
        const uploadedImages = [];
        
        for (const imageData of images) {
          // Upload to cloudinary
          const uploadResult = await cloudinary.uploader.upload(imageData.base64, {
            folder: 'campusbuzz/messages',
            resource_type: 'image',
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto' }
            ]
          });

          uploadedImages.push({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            caption: imageData.caption || ''
          });
        }

        messageData.images = uploadedImages;
        messageData.messageType = content?.trim() ? 'mixed' : 'image';
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return res.status(500).json({ 
          message: 'Failed to upload images', 
          success: false 
        });
      }
    }

    // Handle shared post if provided
    if (sharedPost) {
      console.log('Backend received shared post:', sharedPost);
      console.log('Shared post images:', sharedPost.images);
      
      messageData.messageType = 'shared_post';
      messageData.sharedPost = {
        postId: sharedPost.postId,
        author: {
          name: sharedPost.author.name,
          avatar: sharedPost.author.avatar,
          _id: sharedPost.author._id
        },
        content: sharedPost.content,
        images: sharedPost.images || [],
        createdAt: sharedPost.createdAt,
        likesCount: sharedPost.likesCount || 0,
        commentsCount: sharedPost.commentsCount || 0
      };
      messageData.content = content?.trim() || `Shared a post by ${sharedPost.author.name}`;
      
      console.log('Created message data:', messageData);
    }

    // Create the message
    const message = await Message.create(messageData);

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

// Get unread message counts for specific connections
export const getUnreadCountsForConnections = async (req, res) => {
  try {
    const userId = req.user._id;
    const { connectionIds } = req.body;

    if (!connectionIds || !Array.isArray(connectionIds)) {
      return res.status(400).json({ message: 'Connection IDs array is required', success: false });
    }

    // Get unread counts for each connection
    const unreadCounts = {};
    
    for (const connectionId of connectionIds) {
      const count = await Message.countDocuments({
        sender: connectionId,
        receiver: userId,
        read: false
      });
      unreadCounts[connectionId] = count;
    }

    return res.status(200).json({ unreadCounts, success: true });
  } catch (error) {
    console.error('GetUnreadCountsForConnections error:', error);
    return res.status(500).json({ message: 'Server error', success: false });
  }
};