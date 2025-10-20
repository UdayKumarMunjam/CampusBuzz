import mongoose from "mongoose";
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: false },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  organizer: { type: String, required: false },
  attendees: { type: Number, default: 0 },
  image: { type: String, default: "" },
  registrationLink: { type: String, default: "" },
  createdBy: { type: String, required: true } 
}, { timestamps: true });
export const Event = mongoose.model("Event", eventSchema);
