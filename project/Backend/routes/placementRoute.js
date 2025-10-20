import express from "express";
import { createPlacement, getPlacements, deletePlacement, getPlacementYears } from "../controller/placementController.js";
import isAuthenticated from "../config/auth.js";

const router = express.Router();

// Get all placement achievements (with optional year filter)
router.route("/")
  .get(getPlacements)
  .post(isAuthenticated, createPlacement);

// Get available years for filtering
router.route("/years").get(getPlacementYears);

// Delete placement achievement
router.route("/:placementId").delete(isAuthenticated, deletePlacement);

export default router;