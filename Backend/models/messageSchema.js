import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    trim: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'mixed', 'shared_post'],
    default: 'text'
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    }
  }],
  sharedPost: {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    },
    author: {
      name: String,
      avatar: String,
      _id: mongoose.Schema.Types.ObjectId
    },
    content: String,
    images: [String],
    createdAt: Date,
    likesCount: Number,
    commentsCount: Number
  },
  read: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);