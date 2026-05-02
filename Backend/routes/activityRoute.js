import express from "express";
import {
  createActivity,
  getActivitiesByClub,
  getAllActivities,
  updateActivity,
  deleteActivity
} from "../controller/activityController.js";
import isAuthenticated from "../config/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// Public route to get activities by club
router.get("/club/:clubId", getActivitiesByClub);

// Authenticated routes
router.post("/", isAuthenticated, upload.single("media"), createActivity);
router.get("/", isAuthenticated, getAllActivities);
router.put("/:activityId", isAuthenticated, upload.single("media"), updateActivity);
router.delete("/:activityId", isAuthenticated, deleteActivity);

export default router;