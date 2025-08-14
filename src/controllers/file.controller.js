import { v4 as uuidv4 } from "uuid";
import supabase from "../config/supabaseClient.js";
import { insertFileMeta, listFilesByUser } from "../models/file.model.js";

export const uploadFile = async (req, res) => {
  try {
    // Multer puts file in req.file (memory buffer)
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // size check (multer already enforces, but double-check for nicer msg)
    const maxBytes = (parseInt(process.env.MAX_FILE_SIZE_MB || "100", 10)) * 1024 * 1024;
    if (req.file.size > maxBytes) {
      return res.status(413).json({ message: `File too large. Max ${process.env.MAX_FILE_SIZE_MB} MB` });
    }

    const userId = req.user; // set by auth middleware
    const folderId = req.body.folderId;
    const bucket = process.env.BUCKET_NAME || "user-files";

    const originalName = req.file.originalname;
    const ext = originalName.includes(".") ? originalName.split(".").pop() : "";
    const uniqueName = `${uuidv4()}${ext ? "." + ext : ""}`;

     // Validate folderId
    const validFolderId = folderId && typeof folderId === "string" ? folderId : null;

    // Organize by user/folder for easier housekeeping
    const path = `${userId}/${validFolderId || "root"}/${uniqueName}`;

    // Upload to Supabase Storage (private bucket)
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) {
      // common cause: duplicate path when upsert=false
      return res.status(500).json({ message: "Upload failed", detail: uploadError.message });
    }
   
    // Save metadata
    const meta = {
      user_id: userId,
      folder_id: validFolderId,
      name: originalName,
      type: req.file.mimetype,
      size: req.file.size,
      path,
      bucket
    };

    const saved = await insertFileMeta(meta);

    res.status(201).json({
      message: "File uploaded",
      file: saved
    });
  } catch (err) {
    // Multer size limit error
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: `File too large. Max ${process.env.MAX_FILE_SIZE_MB} MB` });
    }
    res.status(500).json({ message: err.message || "Upload error" });
  }
};

export const getMyFiles = async (req, res) => {
  try {
    const userId = req.user;
    const { folderId, limit, offset } = req.query;
    const files = await listFilesByUser(userId, {
      folderId: folderId || null,
      limit: parseInt(limit || "50", 10),
      offset: parseInt(offset || "0", 10)
    });
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch files" });
  }
};
