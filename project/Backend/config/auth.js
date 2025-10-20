import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {User} from "../models/userSchema.js";  // ✅ Import the User model
dotenv.config({
    path: "../config/.env"
});

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    // console.log("Token from cookies:", token);

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated",
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    // console.log("Decoded JWT:", decoded);

    // ✅ Find the user by ID from the database
    const user = await User.findById(decoded.userId).select("-password"); // Exclude password field

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // ✅ Store the entire user object in req.user
    req.user = user;

    next(); // Proceed to the next middleware or route handler

  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({
      message: "Invalid or expired token",
      success: false,
    });
  }
};

export default isAuthenticated;
