import { Post } from "../models/postSchema.js";
import { User } from "../models/userSchema.js";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
dotenv.config({ path: ".env" });

// ✅ Create a new post
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const files = req.files;

    if (!content && (!files || files.length === 0)) {
      return res.status(400).json({
        message: "Post content or media is required",
        success: false,
      });
    }

    let media = [];

    if (files && files.length > 0) {
      // Optional: validate file types
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "video/mp4", "video/quicktime"];

      // Validate all files first
      for (const file of files) {
        if (!allowedTypes.includes(file.mimetype)) {
          return res.status(400).json({
            message: "Unsupported file type",
            success: false,
          });
        }
      }

      // Upload all files in parallel
      const uploadPromises = files.map((file, index) => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: file.mimetype.startsWith("video") ? "video" : "image" },
            (error, result) => {
              if (error) {
                console.error(`Upload failed for file ${index + 1}:`, error);
                reject(error);
              } else {
                console.log(`Upload successful for file ${index + 1}`);
                resolve({
                  url: result.secure_url,
                  type: file.mimetype.startsWith("video") ? "video" : "image"
                });
              }
            }
          );
          uploadStream.end(file.buffer);
        });
      });

      // Wait for all uploads to complete
      try {
        media = await Promise.all(uploadPromises);
        console.log(`Successfully uploaded ${media.length} files`);
      } catch (uploadError) {
        console.error("One or more file uploads failed:", uploadError);
        return res.status(500).json({
          message: "Failed to upload one or more files",
          success: false,
        });
      }
    }

    const post = await Post.create({
      userId: req.user._id,
      content,
      media,
      likes: [],
    });

    // Populate the created post
    const populatedPost = await Post.findById(post._id).populate('userId', 'name avatar role').populate('comments.userId', 'name avatar');

    // Increment user's post count
    await User.findByIdAndUpdate(req.user._id, { $inc: { posts: 1 } });

    return res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
      success: true,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ✅ Delete post
export const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    // Only owner or admin can delete
    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorized",
        success: false,
      });
    }

    // Remove media from Cloudinary if exists
    if (post.media && post.media.length > 0) {
      for (const mediaItem of post.media) {
        try {
          const publicId = mediaItem.url.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId, { resource_type: mediaItem.type });
        } catch (err) {
          console.warn("Cloudinary deletion failed:", err.message);
        }
      }
    }

    await Post.findByIdAndDelete(postId);

    // Decrement user's post count if owner deleted
    if (post.userId.toString() === req.user._id.toString()) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { posts: -1 } });
    }

    return res.status(200).json({
      message: "Post deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Delete Post Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ✅ Get all posts (with pagination support)
export const getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar role')
      .populate('comments.userId', 'name avatar');

    const totalPosts = await Post.countDocuments();

    return res.status(200).json({
      posts,
      page,
      totalPages: Math.ceil(totalPosts / limit),
      success: true,
    });
  } catch (error) {
    console.error("Get Posts Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ✅ Like/Unlike post
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found", success: false });
    }

    const userId = req.user._id.toString();

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    const populatedPost = await Post.findById(post._id).populate('userId', 'name avatar role').populate('comments.userId', 'name avatar');

    return res.status(200).json({ message: "Post updated successfully", post: populatedPost, success: true });
  } catch (error) {
    console.error("Like Post Error:", error);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};

// ✅ Add comment to post
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment content is required",
        success: false,
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    const newComment = {
      userId: req.user._id,
      content: content.trim(),
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'name avatar role')
      .populate('comments.userId', 'name avatar');

    return res.status(201).json({
      message: "Comment added successfully",
      post: populatedPost,
      success: true,
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ✅ Delete comment from post
export const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    const commentIndex = post.comments.findIndex(comment => comment._id.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({
        message: "Comment not found",
        success: false,
      });
    }

    const comment = post.comments[commentIndex];

    // Only comment owner or admin can delete
    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Unauthorized",
        success: false,
      });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('userId', 'name avatar role')
      .populate('comments.userId', 'name avatar');

    return res.status(200).json({
      message: "Comment deleted successfully",
      post: populatedPost,
      success: true,
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ✅ Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).populate('comments.userId', 'name avatar');
    if (!post) {
      return res.status(404).json({
        message: "Post not found",
        success: false,
      });
    }

    return res.status(200).json({
      comments: post.comments,
      success: true,
    });
  } catch (error) {
    console.error("Get Comments Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// ✅ Get posts by specific user
export const getPostsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const posts = await Post.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name avatar role')
      .populate('comments.userId', 'name avatar');

    const totalPosts = await Post.countDocuments({ userId });

    return res.status(200).json({
      posts,
      page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      success: true,
    });
  } catch (error) {
    console.error("Get Posts By User Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
