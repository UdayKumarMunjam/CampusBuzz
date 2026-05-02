import express from "express";
import { createLostFound, getLostFound, markResolved, sendMessage, deleteLostFound } from "../controller/lostFoundController.js";
import isAuthenticated from "../config/auth.js";
import upload from "../config/multer.js";

const router = express.Router();

// Public
router.get("/", getLostFound);

// Authenticated
router.post("/", isAuthenticated, upload.single("media"), createLostFound);
router.put("/resolve/:id", markResolved);
router.get("/resolve/:id", markResolved);
router.post("/sendMessage", isAuthenticated, sendMessage);
router.delete("/:id", isAuthenticated, deleteLostFound);

export default router;
