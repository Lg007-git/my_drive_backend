import express from "express";
import multer from "multer";
import supabase from "../config/supabaseClient.js";
import { protect } from "../middleware/authMiddleware.js";
import { v4 as uuidv4 } from "uuid";
import { uploadFile, getMyFiles,deleteFile, restoreFileController ,permanentDelete } from "../controllers/file.controller.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import * as fileController from "../controllers/file.controller.js";


const router = express.Router();

// Multer setup - store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// router.post("/upload", protect, upload.single("file"), async (req, res) => {
//   try {
//     if (!req.file) return res.status(400).json({ message: "No file uploaded" });

//     const fileExt = req.file.originalname.split(".").pop();
//     const fileName = `${uuidv4()}.${fileExt}`;

//     const { error } = await supabase.storage
//       .from("drive")
//       .upload(`${req.user.id}/${fileName}`, req.file.buffer, {
//         contentType: req.file.mimetype,
//         upsert: false
//       });

//     if (error) throw error;

//     res.json({ message: "File uploaded successfully", fileName });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/", protect, getMyFiles);
// Files
router.delete("/file/:fileId", protect, deleteFile);
router.post("/file/restore/:fileId", protect, restoreFileController);

// Secure file access with role checks
router.get("/:fileId", protect, checkPermission(["viewer", "editor", "owner"]), fileController.getFile);


router.delete("/file/permanent/:fileId", protect, permanentDelete);
export default router;
