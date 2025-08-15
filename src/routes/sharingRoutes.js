import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { shareFileController, getFilePermissionController } from "../controllers/sharing.controller.js";
import { getSignedUrl } from "../utils/supabaseStorage.js";

const router = express.Router();

// Share file
router.post("/share", protect, shareFileController);

// Get permissions for a file
router.get("/permission/:fileId", protect, getFilePermissionController);

// routes/sharing.routes.js
router.get("/public/:link", async (req, res) => {
  const { link } = req.params;
  try {
    const { data, error } = await supabase
      .from("shared_files")
      .select("file_id, role")
      .eq("link", link)
      .single();

    if (error || !data) return res.status(404).json({ message: "Invalid link" });

    // Fetch file details
    const { data: file, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("id", data.file_id)
      .single();

    if (fileError) throw fileError;

    const signedUrl = await getSignedUrl(file.bucket, file.path, 300);
    res.json({ file: { ...file, signedUrl }, role: data.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
