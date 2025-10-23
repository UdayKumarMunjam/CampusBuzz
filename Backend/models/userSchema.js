import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String, // 'student', 'teacher', 'admin', 'club_head', 'code_club_head', etc.
    required: true,
    default: 'student'
  },
  avatar: {
    type: String,
    default: null // Will be generated dynamically on frontend using getLetterAvatar utility
  },
  status: {
    type: String, // 'active' or 'inactive'
    default: 'active'
  },
  posts: {
    type: Number, // optional, number of posts by this user
    default: 0
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  connections: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'connected'],
      default: 'pending'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    },
    connectedAt: {
      type: Date
    }
  }],
  connectionRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  resetPasswordToken: {
    type: String,
    default: null
  },
  resetPasswordExpiry: {
    type: Date,
    default: null
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
