import { v4 as uuidv4, validate as isUUID } from "uuid";
import supabase from "../config/supabaseClient.js";
import {
  insertFileMeta,
  listFilesByUser,
  softDeleteFile,
  restoreFile,
  getFileById,
  hardDeleteFile,
} from "../models/file.model.js";
import { getSignedUrl } from "../utils/supabaseStorage.js"; // ✅ Needed for getFile()

// ------------------- Upload File -------------------
export const uploadFile = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const maxBytes =
      parseInt(process.env.MAX_FILE_SIZE_MB || "100", 10) * 1024 * 1024;
    if (req.file.size > maxBytes) {
      return res.status(413).json({
        message: `File too large. Max ${process.env.MAX_FILE_SIZE_MB} MB`,
      });
    }

    const userId = req.user;
    let folderIdRaw = req.body.folderId;
    folderIdRaw = folderIdRaw && isUUID(folderIdRaw) ? folderIdRaw : null;

    const bucket = process.env.BUCKET_NAME;
    const originalName = req.file.originalname;
    const ext = originalName.includes(".")
      ? originalName.split(".").pop()
      : "";
    const uniqueName = `${uuidv4()}${ext ? "." + ext : ""}`;
    const path = `${userId}/${folderIdRaw || "root"}/${uniqueName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return res
        .status(500)
        .json({ message: "Upload failed", detail: uploadError.message });
    }

    const meta = {
      user_id: userId,
      folder_id: folderIdRaw,
      name: originalName,
      type: req.file.mimetype,
      size: req.file.size,
      path,
      bucket,
    };

    const saved = await insertFileMeta(meta);

    res.status(201).json({
      message: "File uploaded",
      file: saved,
    });
  } catch (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: `File too large. Max ${process.env.MAX_FILE_SIZE_MB} MB`,
      });
    }
    res.status(500).json({ message: err.message || "Upload error" });
  }
};

// ------------------- Get My Files -------------------
export const getMyFiles = async (req, res) => {
  try {
    const userId = req.user;
    const { folderId, limit, offset } = req.query;

    const files = await listFilesByUser(userId, {
      folderId: folderId || null,
      limit: parseInt(limit || "50", 10),
      offset: parseInt(offset || "0", 10),
    });

    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch files" });
  }
};

// ------------------- Soft Delete -------------------
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user;
    const deleted = await softDeleteFile(fileId, userId);
    res.json({ message: "File moved to trash", file: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ------------------- Restore File -------------------
export const restoreFileController = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user;
    const restored = await restoreFile(fileId, userId);
    res.json({ message: "File restored", file: restored });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const permanentDelete = async (req, res) => {
  try {
    const { fileId } = req.params;
    const userId = req.user;

    // Get file record (only if it belongs to this user)
    const file = await getFileById(fileId, userId);

    // Enforce: only allow permanent delete from Trash
    if (!file.is_trashed) {
      return res.status(400).json({ message: "Move file to Trash before permanent delete" });
    }

    // Remove from storage first (ignore missing file errors gracefully)
    const { error: storageErr } = await supabase.storage
      .from(file.bucket)
      .remove([file.path]);
    // storageErr may be null even if file didn't exist; we proceed regardless

    // Remove DB row
    await hardDeleteFile(fileId, userId);

    res.json({ message: "File permanently deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message || "Permanent delete failed" });
  }
};

// ------------------- Get File with Signed URL -------------------
export const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const { data: fileData, error: fileError } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fileError || !fileData) {
      return res.status(404).json({ message: "File not found" });
    }

    // Generate signed URL for 1 minute (60 seconds)
    const signedUrl = await getSignedUrl(fileData.bucket, fileData.path, 60);

    res.json({
      id: fileData.id,
      name: fileData.name,
      type: fileData.type,
      size: fileData.size,
      created_at: fileData.created_at,
      signedUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
