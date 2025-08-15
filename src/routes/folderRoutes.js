import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createFolder, getFolders, deleteFolder, restoreFolderController  } from "../controllers/folder.controller.js";

const router = express.Router();

router.post("/create", protect, createFolder);       // Create folder
router.get("/", protect, getFolders);          // List folders
// router.delete("/:id", protect, deleteFolder);  // Delete folder
// // Folders
router.delete("/folder/:folderId", protect, deleteFolder);
router.post("/folder/restore/:folderId", protect, restoreFolderController);

export default router;
