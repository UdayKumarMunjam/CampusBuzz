import express from "express";
import { createNotice, getNotices, deleteNotice } from "../controller/noticeController.js";
import isAuthenticated from "../config/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// Public route
router.get("/", getNotices);

// Auth routes
router.post("/", isAuthenticated, upload.single("file"), createNotice);
router.delete("/:noticeId", isAuthenticated, deleteNotice);

export default router;
