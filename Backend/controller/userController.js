import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cloudinary from "../config/cloudinary.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
dotenv.config({ path: ".env" });

// Helper function to generate random password
const generateRandomPassword = () => {
  return crypto.randomBytes(8).toString('hex'); // 16 character password
};

// Helper function to send welcome email
const sendWelcomeEmail = async (user, password) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Welcome to CampusBuzz!</h1>
            <p>Your account has been created successfully</p>
          </div>
          <div class="content">
            <h2>Hello ${user.name}!</h2>
            <p>An administrator has created an account for you on CampusBuzz. Here are your login credentials:</p>
            
            <div class="credentials">
              <h3>📧 Login Credentials</h3>
              <p><strong>Email:</strong> ${user.email}</p>
              <p><strong>Username:</strong> ${user.username}</p>
              <p><strong>Temporary Password:</strong> ${password}</p>
              <p><strong>Role:</strong> ${user.role}</p>
            </div>
            
            <p><strong>🔒 Security Note:</strong> Please change your password after your first login for security purposes.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="button">
              Login to CampusBuzz
            </a>
            
            <h3>🚀 What's Next?</h3>
            <ul>
              <li>Log in using the credentials above</li>
              <li>Complete your profile information</li>
              <li>Start connecting with your campus community</li>
              <li>Explore posts, events, and announcements</li>
            </ul>
            
            <p>If you have any questions or need assistance, please contact the administrator or our support team.</p>
          </div>
          <div class="footer">
            <p>This email was sent automatically. Please do not reply to this email.</p>
            <p>&copy; 2024 CampusBuzz. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: '🎓 Welcome to CampusBuzz - Your Account Details',
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${user.email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error - user creation should still succeed even if email fails
  }
};

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

    // Generate password if not provided
    const userPassword = password || generateRandomPassword();
    const hashedPassword = await bcryptjs.hash(userPassword, 10);

    const user = await User.create({ name, username, email, password: hashedPassword, role, avatar });

    // Send welcome email with credentials
    await sendWelcomeEmail(user, userPassword);

    return res.status(201).json({ 
      message: "User added successfully and welcome email sent", 
      user, 
      success: true 
    });
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
     console.log("Login attempt - Request body:", { email: req.body.email, password: req.body.password ? "[REDACTED]" : undefined });

     const { email, password } = req.body;
     if (!email || !password) {
       console.log("Login failed - Missing fields:", { email: !!email, password: !!password });
       return res.status(400).json({ message: "All fields are required", success: false });
     }

     console.log("Login - Looking up user by email:", email);
     const user = await User.findOne({ email });
     if (!user) {
       console.log("Login failed - User not found for email:", email);
       return res.status(401).json({ message: "Invalid credentials", success: false });
     }

     console.log("Login - User found, comparing passwords");
     const isMatch = await bcryptjs.compare(password, user.password);
     if (!isMatch) {
       console.log("Login failed - Password mismatch for user:", user._id);
       return res.status(401).json({ message: "Invalid credentials", success: false });
     }

     console.log("Login - Password match, generating token for user:", user._id);
     const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, { expiresIn: "1d" });

     console.log("Login successful - Token generated, setting cookie for user:", user._id);
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

// Forgot Password - Send reset email
export const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User with this email does not exist", success: false });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Reset URL
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'CampusBuzz - Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your CampusBuzz account. Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
          <p><strong>This link will expire in 10 minutes.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is an automated email from CampusBuzz. Please do not reply.</p>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({ 
      message: "Password reset email sent successfully", 
      success: true 
    });

  } catch (error) {
    console.error("ForgotPassword error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// Reset Password - Update password with token
export const ResetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required", success: false });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long", success: false });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token", success: false });
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return res.status(200).json({ 
      message: "Password reset successfully", 
      success: true 
    });

  } catch (error) {
    console.error("ResetPassword error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
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

// Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        message: "You cannot connect with yourself",
        success: false,
      });
    }

    const userToConnect = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToConnect || !currentUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if already connected
    const existingConnection = currentUser.connections.find(
      conn => conn.user.toString() === userId
    );

    if (existingConnection && existingConnection.status === 'connected') {
      return res.status(400).json({
        message: "Already connected",
        success: false,
      });
    }

    // Check if request already sent
    const existingRequest = userToConnect.connectionRequests.find(
      req => req.user.toString() === currentUserId.toString()
    );

    if (existingRequest) {
      return res.status(400).json({
        message: "Connection request already sent",
        success: false,
      });
    }

    // Add to recipient's connection requests
    userToConnect.connectionRequests.push({ user: currentUserId });

    // Add to sender's connections as pending
    currentUser.connections.push({
      user: userId,
      status: 'pending'
    });

    await currentUser.save();
    await userToConnect.save();

    return res.status(200).json({
      message: "Connection request sent successfully",
      success: true,
    });
  } catch (error) {
    console.error("Send Connection Request Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const requestingUser = await User.findById(userId);

    if (!currentUser || !requestingUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Find and remove the request
    const requestIndex = currentUser.connectionRequests.findIndex(
      req => req.user.toString() === userId
    );

    if (requestIndex === -1) {
      return res.status(400).json({
        message: "No connection request found",
        success: false,
      });
    }

    currentUser.connectionRequests.splice(requestIndex, 1);

    // Update sender's connection status to connected
    const senderConnection = requestingUser.connections.find(
      conn => conn.user.toString() === currentUserId.toString()
    );

    if (senderConnection) {
      senderConnection.status = 'connected';
      senderConnection.connectedAt = new Date();
    }

    // Add to current user's connections
    currentUser.connections.push({
      user: userId,
      status: 'connected',
      connectedAt: new Date()
    });

    await currentUser.save();
    await requestingUser.save();

    return res.status(200).json({
      message: "Connection request accepted",
      success: true,
    });
  } catch (error) {
    console.error("Accept Connection Request Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Decline connection request
export const declineConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const requestingUser = await User.findById(userId);

    if (!currentUser || !requestingUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Find and remove the request
    const requestIndex = currentUser.connectionRequests.findIndex(
      req => req.user.toString() === userId
    );

    if (requestIndex === -1) {
      return res.status(400).json({
        message: "No connection request found",
        success: false,
      });
    }

    currentUser.connectionRequests.splice(requestIndex, 1);

    // Remove from sender's connections
    requestingUser.connections = requestingUser.connections.filter(
      conn => conn.user.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await requestingUser.save();

    return res.status(200).json({
      message: "Connection request declined successfully",
      success: true,
    });
  } catch (error) {
    console.error("Decline Connection Request Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Cancel connection request (for the sender)
export const cancelConnectionRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Remove from current user's connections (pending status)
    currentUser.connections = currentUser.connections.filter(
      conn => conn.user.toString() !== userId
    );

    // Remove from target user's connection requests
    targetUser.connectionRequests = targetUser.connectionRequests.filter(
      req => req.user.toString() !== currentUserId.toString()
    );

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      message: "Connection request canceled successfully",
      success: true,
    });
  } catch (error) {
    console.error("Cancel Connection Request Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get connection status between two users
export const getConnectionStatus = async (req, res) => {
try {
  const { userId } = req.params;
  const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if connected
    const connection = currentUser.connections.find(
      conn => conn.user.toString() === userId
    );

    // Check if there's a pending request from target user
    const hasRequestFromTarget = currentUser.connectionRequests.some(
      req => req.user.toString() === userId
    );

    let status = 'not_connected';
    if (connection) {
      status = connection.status; // 'pending' or 'connected'
    } else if (hasRequestFromTarget) {
      status = 'request_received';
    }

    return res.status(200).json({
      status,
      success: true,
    });
  } catch (error) {
    console.error("Get Connection Status Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get connection statuses for multiple users
export const getConnectionStatuses = async (req, res) => {
  try {
    const { userIds } = req.body; // Array of user IDs
    const currentUserId = req.user._id;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        message: "userIds array is required",
        success: false,
      });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({
        message: "Current user not found",
        success: false,
      });
    }

    const statuses = {};

    for (const userId of userIds) {
      // Check if connected
      const connection = currentUser.connections.find(
        conn => conn.user.toString() === userId
      );

      // Check if there's a pending request from target user
      const hasRequestFromTarget = currentUser.connectionRequests.some(
        req => req.user.toString() === userId
      );

      let status = 'not_connected';
      if (connection) {
        status = connection.status; // 'pending' or 'connected'
      } else if (hasRequestFromTarget) {
        status = 'request_received';
      }

      statuses[userId] = status;
    }

    return res.status(200).json({
      statuses,
      success: true,
    });
  } catch (error) {
    console.error("Get Connection Statuses Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get user's connections
export const getConnections = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .populate('connections.user', 'name avatar username role')
      .select('connections');

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const connections = user.connections.filter(conn => conn.status === 'connected');

    return res.status(200).json({
      connections,
      success: true,
    });
  } catch (error) {
    console.error("Get Connections Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Get connection requests
export const getConnectionRequests = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId)
      .populate('connectionRequests.user', 'name avatar username role')
      .select('connectionRequests');

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      requests: user.connectionRequests,
      success: true,
    });
  } catch (error) {
    console.error("Get Connection Requests Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// Follow/Unfollow user (keeping for backward compatibility)
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

// Disconnect from a user
export const disconnectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(userId);

    if (!currentUser || !targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if users are connected
    const currentUserConnection = currentUser.connections.find(
      conn => conn.user.toString() === userId && conn.status === 'connected'
    );

    const targetUserConnection = targetUser.connections.find(
      conn => conn.user.toString() === currentUserId.toString() && conn.status === 'connected'
    );

    if (!currentUserConnection || !targetUserConnection) {
      return res.status(400).json({
        message: "No connection found between users",
        success: false,
      });
    }

    // Remove connections from both users
    currentUser.connections = currentUser.connections.filter(
      conn => !(conn.user.toString() === userId && conn.status === 'connected')
    );

    targetUser.connections = targetUser.connections.filter(
      conn => !(conn.user.toString() === currentUserId.toString() && conn.status === 'connected')
    );

    await currentUser.save();
    await targetUser.save();

    return res.status(200).json({
      message: "Connection removed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Disconnect User Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
