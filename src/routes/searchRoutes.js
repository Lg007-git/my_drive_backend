// routes/search.routes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { searchFilesController } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", protect, searchFilesController);

export default router;
