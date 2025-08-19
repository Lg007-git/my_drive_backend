import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createFolder, getFolders, softdeleteFolder, restoreFolderController,DeleteFolderById ,getTrashedFolders ,renameFolderController } from "../controllers/folder.controller.js";

const router = express.Router();

router.post("/create", protect, createFolder);       // Create folder
router.get("/", protect, getFolders);          // List folders
router.delete("/:id", protect, DeleteFolderById);  // Delete folder
// // Folders
router.delete("/folder/:folderId", protect, softdeleteFolder);
router.post("/folder/restore/:folderId", protect, restoreFolderController);
router.get("/trash", protect, getTrashedFolders);
router.patch("/:id", protect, renameFolderController);

export default router;
