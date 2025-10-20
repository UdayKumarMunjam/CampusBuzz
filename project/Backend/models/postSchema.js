import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userDetails: {
    name: String,
    avatar: String,
    role: String,
  },
  content: {
    type: String,
    required: false,
  },
  reports: {
    type: [mongoose.Schema.Types.ObjectId], // user IDs who reported
    default: []
  },
  shares: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  media: [new mongoose.Schema({
    url: { type: String, required: true },
    type: { type: String, required: true, enum: ['image', 'video'] }
  })],
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: [],
  },
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

export const Post = mongoose.model('Post', postSchema);
