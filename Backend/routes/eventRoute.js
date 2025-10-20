import express from "express";
import { createEvent, getEvents, deleteEvent } from "../controller/eventController.js";
import isAuthenticated from "../config/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// Public route to get events
router.get("/", getEvents);

// Authenticated routes
router.post("/", isAuthenticated, upload.single("media"), createEvent);
router.delete("/:eventId", isAuthenticated, deleteEvent);

export default router;
