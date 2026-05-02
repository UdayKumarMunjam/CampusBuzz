import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

dotenv.config();

// ================= LOGIN =================
export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
        path: "/",
      })
      .json({
        message: `Welcome back ${user.name}`,
        user,
        success: true,
      });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ================= LOGOUT =================
export const Logout = (req, res) => {
  return res
    .cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      expires: new Date(0),
      path: "/",
    })
    .json({ message: "Logout successful", success: true });
};

// ================= CHECK AUTH =================
export const CheckAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }
    return res.status(200).json({ user, success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ================= PROFILE =================
export const GetProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({ user, success: true });
  } catch {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const UpdateProfile = async (req, res) => {
  try {
    const updates = req.body;

    if (updates.password) {
      updates.password = await bcryptjs.hash(updates.password, 10);
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      updates.avatar = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select("-password");

    return res.status(200).json({ user, success: true });

  } catch {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const GetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found", success: false });
    return res.status(200).json({ user, success: true });
  } catch {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ================= CLUB =================
export const AddClubMember = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists", success: false });
    }

    const password = await bcryptjs.hash(process.env.PASSWORD, 10);

    const user = await User.create({
      name,
      email,
      username: email.split("@")[0],
      password,
      role,
      avatar: "https://i.pravatar.cc/150"
    });

    return res.status(201).json({ message: "Member added", user, success: true });

  } catch {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const GetClubMembers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ members: users, success: true });
  } catch {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ================= FOLLOW =================
export const followUser = async (req, res) => {
  const { userId } = req.params;
  const currentUser = await User.findById(req.user._id);
  const targetUser = await User.findById(userId);

  if (currentUser.following.includes(userId)) {
    currentUser.following.pull(userId);
    targetUser.followers.pull(req.user._id);
  } else {
    currentUser.following.push(userId);
    targetUser.followers.push(req.user._id);
  }

  await currentUser.save();
  await targetUser.save();

  res.json({ success: true });
};

export const getFollowers = async (req, res) => {
  const user = await User.findById(req.params.userId).populate("followers");
  res.json({ followers: user.followers });
};

export const getFollowing = async (req, res) => {
  const user = await User.findById(req.params.userId).populate("following");
  res.json({ following: user.following });
};

// ================= SEARCH =================
export const searchUsers = async (req, res) => {
  const { query } = req.query;
  const users = await User.find({
    name: { $regex: query, $options: "i" }
  }).select("-password");

  res.json({ users });
};

// ================= CONNECTION =================
export const sendConnectionRequest = async (req, res) => {
  const { userId } = req.params;
  const currentUser = await User.findById(req.user._id);
  const targetUser = await User.findById(userId);

  targetUser.connectionRequests.push({ user: currentUser._id });
  currentUser.connections.push({ user: userId, status: "pending" });

  await currentUser.save();
  await targetUser.save();

  res.json({ success: true });
};

export const acceptConnectionRequest = async (req, res) => {
  const { userId } = req.params;

  const currentUser = await User.findById(req.user._id);
  const sender = await User.findById(userId);

  currentUser.connectionRequests = currentUser.connectionRequests.filter(
    r => r.user.toString() !== userId
  );

  currentUser.connections.push({ user: userId, status: "connected" });

  sender.connections = sender.connections.map(c =>
    c.user.toString() === currentUser._id.toString()
      ? { ...c, status: "connected" }
      : c
  );

  await currentUser.save();
  await sender.save();

  res.json({ success: true });
};

export const declineConnectionRequest = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(req.user._id);

  user.connectionRequests = user.connectionRequests.filter(
    r => r.user.toString() !== userId
  );

  await user.save();
  res.json({ success: true });
};

export const cancelConnectionRequest = async (req, res) => {
  res.json({ success: true });
};

export const getConnectionStatus = async (req, res) => {
  res.json({ status: "not_connected" });
};

export const getConnectionStatuses = async (req, res) => {
  res.json({ statuses: {} });
};

export const getConnections = async (req, res) => {
  const user = await User.findById(req.params.userId).populate("connections.user");
  res.json({ connections: user.connections });
};

export const getConnectionRequests = async (req, res) => {
  const user = await User.findById(req.user._id).populate("connectionRequests.user");
  res.json({ requests: user.connectionRequests });
};

export const disconnectUser = async (req, res) => {
  res.json({ success: true });
};

export const cleanupDuplicateConnections = async (req, res) => {
  res.json({ success: true });
};

// ================= PASSWORD =================
export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.json({ success: true });

  } catch {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    user.password = await bcryptjs.hash(newPassword, 10);
    await user.save();

    res.json({ success: true });

  } catch {
    return res.status(500).json({ message: "Server error", success: false });
  }
};