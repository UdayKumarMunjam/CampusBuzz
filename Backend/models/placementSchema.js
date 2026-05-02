import mongoose from 'mongoose';

const placementSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  images: [{
    url: { type: String, required: true },
    type: { type: String, required: true, enum: ['image'], default: 'image' }
  }],
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

export const Placement = mongoose.model('Placement', placementSchema);