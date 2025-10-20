  import { Notice } from "../models/noticeSchema.js";
  import cloudinary from "../config/cloudinary.js";

  // Get all notices
  export const getNotices = async (req, res) => {
    try {
      const notices = await Notice.find().sort({ createdAt: -1 });
      return res.status(200).json({ notices, success: true });
    } catch (error) {
      console.error("Get Notices Error:", error);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  };

  // Create Notice
  export const createNotice = async (req, res) => {
    try {
      const userRole = req.user.role;
      if (!["admin", "teacher"].includes(userRole)) {
        return res.status(403).json({ message: "Unauthorized", success: false });
      }

      const { title, content, author, category } = req.body;
      const file = req.file; // optional

      let fileUrl = "";
      if (file) {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: "raw", // auto handles image/pdf/video
              folder: "enotices",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(file.buffer);
        });
        fileUrl = result.secure_url;
      }

      const notice = await Notice.create({
        title,
        content,
        author,
        category,
        fileUrl, // may be empty if no file
        createdBy: req.user.name,
      });

      return res.status(201).json({ message: "Notice created successfully", notice, success: true });
    } catch (error) {
      console.error("Create Notice Error:", error);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  };

  // Delete Notice
  export const deleteNotice = async (req, res) => {
    try {
      const userRole = req.user.role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Unauthorized", success: false });
      }

      const { noticeId } = req.params;
      const notice = await Notice.findByIdAndDelete(noticeId);

      if (!notice) {
        return res.status(404).json({ message: "Notice not found", success: false });
      }

      return res.status(200).json({ message: "Notice deleted successfully", success: true });
    } catch (error) {
      console.error("Delete Notice Error:", error);
      return res.status(500).json({ message: "Internal server error", success: false });
    }
  };
