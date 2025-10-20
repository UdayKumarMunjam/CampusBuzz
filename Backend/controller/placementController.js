import { Placement } from "../models/placementSchema.js";
import cloudinary from "../config/cloudinary.js";

// ✅ Create a new placement achievement
export const createPlacement = async (req, res) => {
  try {
    const { description, imageUrls } = req.body;

    if (!description || !imageUrls || imageUrls.length === 0) {
      return res.status(400).json({
        message: "Description and at least one image URL are required",
        success: false,
      });
    }

    // Check if user is admin or teacher
    if (req.user.role !== "admin" && req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Unauthorized. Only admin or teacher can add placement achievements",
        success: false,
      });
    }

    const placement = await Placement.create({
      description,
      images: imageUrls.map(url => ({
        url,
        type: 'image'
      })),
      uploadedBy: req.user._id,
    });

    const populatedPlacement = await Placement.findById(placement._id).populate('uploadedBy', 'name role');

    return res.status(201).json({
      message: "Placement achievement created successfully",
      placement: populatedPlacement,
      success: true,
    });
  } catch (error) {
    console.error("Create Placement Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ✅ Get all placement achievements
export const getPlacements = async (req, res) => {
  try {
    const placements = await Placement.find({})
      .sort({ createdAt: -1 })
      .populate('uploadedBy', 'name role');

    return res.status(200).json({
      placements,
      success: true,
    });
  } catch (error) {
    console.error("Get Placements Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ✅ Delete placement achievement
export const deletePlacement = async (req, res) => {
  try {
    const { placementId } = req.params;
    const placement = await Placement.findById(placementId);

    if (!placement) {
      return res.status(404).json({
        message: "Placement achievement not found",
        success: false,
      });
    }

    // Only admin or teacher can delete
    if (req.user.role !== "admin" && req.user.role !== "teacher") {
      return res.status(403).json({
        message: "Unauthorized",
        success: false,
      });
    }

    // Remove images from Cloudinary if they are cloudinary URLs
    if (placement.images && placement.images.length > 0) {
      for (const image of placement.images) {
        if (image.url.includes('cloudinary')) {
          try {
            const publicId = image.url.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
          } catch (err) {
            console.warn("Cloudinary deletion failed:", err.message);
          }
        }
      }
    }
    // Note: Base64 images don't need cleanup as they're stored directly

    await Placement.findByIdAndDelete(placementId);

    return res.status(200).json({
      message: "Placement achievement deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Delete Placement Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ✅ Get placement years for filtering (keeping for backward compatibility, but not used)
export const getPlacementYears = async (req, res) => {
  try {
    const years = await Placement.distinct('year');
    years.sort((a, b) => b - a);

    return res.status(200).json({
      years,
      success: true,
    });
  } catch (error) {
    console.error("Get Placement Years Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};