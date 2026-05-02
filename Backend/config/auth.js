import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {User} from "../models/userSchema.js";  // ✅ Import the User model
dotenv.config({
    path: "../config/.env"
});

const isAuthenticated = async (req, res, next) => {
   try {
     console.log("Auth middleware - Checking authentication");
     const token = req.cookies.token;
     console.log("Auth middleware - Token present:", !!token);

     if (!token) {
       console.log("Auth middleware - No token found in cookies");
       return res.status(401).json({
         message: "User not authenticated",
         success: false,
       });
     }

     console.log("Auth middleware - Verifying JWT token");
     const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
     console.log("Auth middleware - JWT decoded successfully, userId:", decoded.userId);

     // ✅ Find the user by ID from the database
     console.log("Auth middleware - Looking up user in database");
     const user = await User.findById(decoded.userId).select("-password"); // Exclude password field

     if (!user) {
       console.log("Auth middleware - User not found in database for userId:", decoded.userId);
       return res.status(404).json({
         message: "User not found",
         success: false,
       });
     }

     console.log("Auth middleware - User found, proceeding with request for user:", user._id);
     // ✅ Store the entire user object in req.user
     req.user = user;

     next(); // Proceed to the next middleware or route handler

   } catch (error) {
     console.error("Auth middleware error:", error);
     console.log("Auth middleware - Token verification failed");
     return res.status(401).json({
       message: "Invalid or expired token",
       success: false,
     });
   }
 };

export default isAuthenticated;
