import { Activity } from "../models/activitySchema.js";
import cloudinary from "../config/cloudinary.js";

// Create Activity
export const createActivity = async (req, res) => {
  try {
    const userRole = req.user.role;
    if (!["admin", "teacher", "club_head"].includes(userRole)) {
      return res.status(403).json({ message: "Unauthorized to create activities", success: false });
    }

    const { title, type, description, date, time, location, maxAttendees, clubId } = req.body;
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

    const activity = await Activity.create({
      title,
      type,
      description,
      date,
      time,
      location,
      maxAttendees: parseInt(maxAttendees) || 50,
      image: mediaUrl,
      clubId,
      createdBy: req.user._id
    });

    return res.status(201).json({ message: "Activity created successfully", activity, success: true });
  } catch (error) {
    console.error("Create Activity Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get activities by club
export const getActivitiesByClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const activities = await Activity.find({ clubId }).populate('createdBy', 'name').sort({ date: 1 });

    const today = new Date();
    const formattedActivities = activities.map(activity => {
      const activityDate = new Date(activity.date);
      return {
        ...activity.toObject(),
        status: activityDate >= today ? "upcoming" : "completed"
      };
    });

    return res.status(200).json({ activities: formattedActivities, success: true });
  } catch (error) {
    console.error("Get Activities Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Get all activities (for admin)
export const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find().populate('createdBy', 'name').sort({ date: 1 });

    const today = new Date();
    const formattedActivities = activities.map(activity => {
      const activityDate = new Date(activity.date);
      return {
        ...activity.toObject(),
        status: activityDate >= today ? "upcoming" : "completed"
      };
    });

    return res.status(200).json({ activities: formattedActivities, success: true });
  } catch (error) {
    console.error("Get All Activities Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Update Activity
export const updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: "Activity not found", success: false });
    }

    const userRole = req.user.role;
    if (!["admin", "teacher"].includes(userRole) && activity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to update this activity", success: false });
    }

    const { title, type, description, date, time, location, maxAttendees } = req.body;
    const file = req.file;

    let mediaUrl = activity.image;
    if (file) {
      // Delete old image if exists
      if (activity.image) {
        try {
          const publicId = activity.image.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        } catch (err) {
          console.warn("Cloudinary deletion failed:", err.message);
        }
      }

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

    const updatedActivity = await Activity.findByIdAndUpdate(
      activityId,
      {
        title,
        type,
        description,
        date,
        time,
        location,
        maxAttendees: parseInt(maxAttendees) || activity.maxAttendees,
        image: mediaUrl
      },
      { new: true }
    ).populate('createdBy', 'name');

    return res.status(200).json({ message: "Activity updated successfully", activity: updatedActivity, success: true });
  } catch (error) {
    console.error("Update Activity Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// Delete Activity
export const deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({ message: "Activity not found", success: false });
    }

    const userRole = req.user.role;
    if (!["admin", "teacher"].includes(userRole) && activity.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this activity", success: false });
    }

    // Delete image from Cloudinary if exists
    if (activity.image) {
      try {
        const publicId = activity.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (err) {
        console.warn("Cloudinary deletion failed:", err.message);
      }
    }

    await Activity.findByIdAndDelete(activityId);

    return res.status(200).json({ message: "Activity deleted successfully", success: true });
  } catch (error) {
    console.error("Delete Activity Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};