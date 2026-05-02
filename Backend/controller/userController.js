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
      return res.status(400).json({ message: "All fields required", success: false });
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
  return res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0),
  }).json({
    message: "User logout successfully",
    success: true,
  });
};

// ================= CHECK AUTH =================
export const CheckAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    return res.status(200).json({ user, success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ================= GET USER BY ID =================
export const GetUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    return res.status(200).json({ user, success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ================= ADD CLUB MEMBER =================
export const AddClubMember = async (req, res) => {
  try {
    const { userId, club } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    user.club = club;
    await user.save();

    return res.status(200).json({
      message: "User added to club",
      user,
      success: true,
    });

  } catch (error) {
    console.error("AddClubMember error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ================= GET CLUB MEMBERS =================
export const GetClubMembers = async (req, res) => {
  try {
    const { club } = req.params;

    const users = await User.find({ club }).select("-password");

    return res.status(200).json({
      users,
      success: true,
    });

  } catch (error) {
    console.error("GetClubMembers error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ================= FORGOT PASSWORD =================
export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `<a href="${resetUrl}">Reset Password</a>`,
    });

    return res.status(200).json({
      message: "Reset email sent",
      success: true,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ================= RESET PASSWORD =================
export const ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid token", success: false });
    }

    user.password = await bcryptjs.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
      success: true,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ================= PROFILE =================
export const GetProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    return res.status(200).json({ user, success: true });
  } catch (error) {
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

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");

    return res.status(200).json({ user, success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
};