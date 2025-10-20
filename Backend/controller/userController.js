import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
dotenv.config({ path: ".env" });

// Admin adds a user
export const AddUserByAdmin = async (req, res) => {
  try {
    const { name, username, email, password, role, avatar } = req.body;

    if (!name || !username || !email || !role) {
      return res.status(400).json({ message: "All fields required", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists", success: false });
    }

    const hashedPassword = password
      ? await bcryptjs.hash(password, 10)
      : await bcryptjs.hash(process.env.PASSWORD, 10); 

    const user = await User.create({ name, username, email, password: hashedPassword, role, avatar });
    return res.status(201).json({ message: "User added successfully", user, success: true });
  } catch (error) {
    console.error("AddUserByAdmin error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Admin edits a user
export const EditUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcryptjs.hash(updates.password, 10);
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    return res.status(200).json({ message: "User updated successfully", user, success: true });
  } catch (error) {
    console.error("EditUserByAdmin error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Admin deletes a user
export const DeleteUserByAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) return res.status(404).json({ message: "User not found", success: false });
    return res.status(200).json({ message: "User deleted successfully", success: true });
  } catch (error) {
    console.error("DeleteUserByAdmin error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

//  Admin fetch all users
export const getAllUsers = async (req, res) => {
  try {
   const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json({ users, success: true });
  } catch (error) {
    console.error("GetAllUsers error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// User login
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials", success: false });

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials", success: false });

    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, { expiresIn: "1d" });

    return res.status(200).cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    }).json({ message: `Welcome back ${user.name}`, user, success: true });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

//  User logout
export const Logout = (req, res) => {
  return res.cookie("token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    expires: new Date(0),
  }).json({ message: "User logout successfully", success: true });
};

//  Check auth status
export const CheckAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("CheckAuth error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// User updates their own profile (email cannot be updated)
export const UpdateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, username, password, phone, location, bio } = req.body;
    const file = req.file;

    // Create updates object excluding email
    const updates = {};
    let isPasswordUpdate = false;

    if (name && name.trim()) updates.name = name.trim();
    if (username && username.trim()) updates.username = username.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (location !== undefined) updates.location = location.trim();
    if (bio !== undefined) updates.bio = bio.trim();

    // Handle avatar upload
    if (file) {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(file.buffer);
      });
      updates.avatar = result.secure_url;
    }

    // Hash password only if provided and not empty
    if (password && password.trim()) {
      updates.password = await bcryptjs.hash(password.trim(), 10);
      isPasswordUpdate = true;
    }

    // Check if username is already taken by another user
    if (updates.username) {
      const existingUser = await User.findOne({ username: updates.username, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ message: "Username already taken", success: false });
      }
    }

    // Only update if there are actual changes
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update", success: false });
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    // Different success messages based on what was updated
    const message = isPasswordUpdate ? "Password updated successfully" : "Profile updated successfully";

    return res.status(200).json({ message, user, success: true });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Get user profile
export const GetProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    
    if (!user) return res.status(404).json({ message: "User not found", success: false });

    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("GetProfile error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Get user profile by userId (for viewing other users' profiles)
export const GetUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select("-password")
      .populate('followers', 'name avatar username role')
      .populate('following', 'name avatar username role');

    if (!user) return res.status(404).json({ message: "User not found", success: false });

    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("GetUserById error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Add club member (for club heads and admins)
export const AddClubMember = async (req, res) => {
  try {
    const { name, email, role, clubId } = req.body;

    if (!name || !email || !role || !clubId) {
      return res.status(400).json({ message: "All fields required", success: false });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists", success: false });
    }

    // Generate username from email
    const username = email.split('@')[0];

    // Use default password
    const hashedPassword = await bcryptjs.hash(process.env.PASSWORD, 10);

    const user = await User.create({
      name,
      username,
      email,
      password: hashedPassword,
      role,
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150'
    });

    return res.status(201).json({ message: "Club member added successfully", user, success: true });
  } catch (error) {
    console.error("AddClubMember error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Follow/Unfollow user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        message: "You cannot follow yourself",
        success: false,
      });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId.toString());
    } else {
      // Follow
      currentUser.following.push(userId);
      userToFollow.followers.push(currentUserId);
    }

    await currentUser.save();
    await userToFollow.save();

    return res.status(200).json({
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      isFollowing: !isFollowing,
      success: true,
    });
  } catch (error) {
    console.error("Follow User Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get user followers
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('followers', 'name avatar username');
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      followers: user.followers,
      success: true,
    });
  } catch (error) {
    console.error("Get Followers Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get user following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).populate('following', 'name avatar username');
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      following: user.following,
      success: true,
    });
  } catch (error) {
    console.error("Get Following Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get club members
export const GetClubMembers = async (req, res) => {
  try {
    const { clubId } = req.params;

    // Get all users with roles that could be club members
    // Note: Currently not filtering by clubId since we don't have a club relationship yet
    // In a real implementation, you'd have a separate ClubMember model or relationship
    const members = await User.find({
      role: { $in: ['Member', 'Vice President', 'Secretary', 'Treasurer', 'President'] }
    }).select("-password").sort({ createdAt: -1 });

    console.log(`Found ${members.length} club members for club ${clubId}`);

    return res.status(200).json({ members, success: true });
  } catch (error) {
    console.error("GetClubMembers error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Search users for messaging
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.trim().length < 1) {
      return res.status(400).json({ message: "Search query is required", success: false });
    }

    // Search users by name or username, excluding current user
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        {
          $or: [
            { name: { $regex: query.trim(), $options: 'i' } },
            { username: { $regex: query.trim(), $options: 'i' } }
          ]
        }
      ]
    })
    .select('name username email avatar role')
    .limit(20)
    .sort({ name: 1 });

    return res.status(200).json({ users, success: true });
  } catch (error) {
    console.error("SearchUsers error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};
