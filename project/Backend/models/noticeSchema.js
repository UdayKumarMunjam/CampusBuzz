import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    category: { 
      type: String, 
      enum: ["academic", "event", "facility", "technical"], 
      default: "academic" 
    },
    fileUrl: { type: String, default: "" }, // optional file (image/pdf/etc.)
    createdBy: { type: String, required: true }, // user name
  },
  { timestamps: true }
);

export const Notice = mongoose.model("Notice", noticeSchema);
