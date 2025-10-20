import mongoose from "mongoose";

const lostFoundSchema = new mongoose.Schema({
  type: { type: String, enum: ["lost", "found"], required: true }, // lost or found
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: "" },
  location: { type: String, required: true },
  status: { type: String, enum: ["active", "resolved"], default: "active" },
  reporterEmail: { type: String, required: true }, // email of reporter
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export const LostFound = mongoose.model("LostFound", lostFoundSchema);
