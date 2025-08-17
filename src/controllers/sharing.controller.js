import { shareFile, getFilePermissions } from "../models/sharing.model.js";
import { getSignedUrl } from "../utils/supabaseStorage.js";
import supabase from "../config/supabaseClient.js";

export const shareFileController = async (req, res) => {
  const { fileId, sharedWith, role } = req.body;
  const sharedBy = req.user;

  try {
    // Insert sharing info
    const shared = await shareFile({ fileId, sharedBy, sharedWith, role });

    // Fetch file metadata to generate signed URL
    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (error || !file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Generate signed URL (5 minutes)
    const signedUrl = await getSignedUrl(file.bucket, file.path, 300);

    res.json({
      message: "File shared successfully",
      shared,
      file: { ...file, signedUrl },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFilePermissionController = async (req, res) => {
  const { fileId } = req.params;
  const userId = req.user;

  try {
    const permissions = await getFilePermissions(fileId, userId);
    if (!permissions || permissions.length === 0) {
      return res.status(404).json({ message: "Not yet shared" });
    }

    res.json({ permissions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
