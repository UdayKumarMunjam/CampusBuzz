import { Event } from "../models/eventSchema.js";
import cloudinary from "../config/cloudinary.js";

// Create Event
export const createEvent = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (!["admin", "teacher", "club_head"].includes(userRole)) {
      return res.status(403).json({ message: "Unauthorized to create events", success: false });
    }

    const { title, description, date, time, location, organizer, maxAttendees, registrationLink } = req.body;
    const file = req.file;

    let mediaUrl = "";
    if (file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: file.mimetype.startsWith("video") ? "video" : "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      mediaUrl = result.secure_url;
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      organizer,
      maxAttendees: parseInt(maxAttendees) || 50,
      image: mediaUrl,
      registrationLink,
      createdBy: userRole
    });

    return res.status(201).json({ message: "Event created successfully", event, success: true });
  } catch (error) {
    console.error("Create Event Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get all events (upcoming and past dynamically based on date)
export const getEvents = async (req, res) => {
  try {
    const today = new Date();
    const events = await Event.find().sort({ date: 1 });

    const formattedEvents = events.map(event => {
      const eventDate = new Date(event.date);
      return {
        ...event.toObject(),
        status: eventDate >= today ? "upcoming" : "past"
      };
    });

    return res.status(200).json({ events: formattedEvents, success: true });
  } catch (error) {
    console.error("Get Events Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Delete Event
export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found", success: false });
    }

    const userRole = req.user.role;
    if (!["admin", "teacher"].includes(userRole)) {
      return res.status(403).json({ message: "Unauthorized to delete", success: false });
    }

    // Delete image from Cloudinary if exists
    if (event.image) {
      try {
        const publicId = event.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (err) {
        console.warn("Cloudinary deletion failed:", err.message);
      }
    }

    await Event.findByIdAndDelete(eventId);

    return res.status(200).json({ message: "Event deleted successfully", success: true });
  } catch (error) {
    console.error("Delete Event Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
