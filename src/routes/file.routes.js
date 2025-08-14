import express from "express";
import { protect } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import { uploadFile, getMyFiles } from "../controllers/file.controller.js";

const router = express.Router();

// Protected routes
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/", protect, getMyFiles);

export default router;
