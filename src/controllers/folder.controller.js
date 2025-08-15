import { v4 as uuidv4, validate as isUUID } from "uuid";
import { insertFolder, listFoldersByUser } from "../models/folder.model.js";
import { softDeleteFolder, restoreFolder } from "../models/folder.model.js";

export const createFolder = async (req, res) => {
  try {
    const userId = req.user;
    let { name, parentId } = req.body;

    if (!name) return res.status(400).json({ message: "Folder name is required" });

    parentId = parentId && isUUID(parentId) ? parentId : null;

    const folder = {
      user_id: userId,
      name,
      parent_folder_id: parentId,
    };

    const savedFolder = await insertFolder(folder);
    res.status(201).json({ message: "Folder created", folder: savedFolder });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create folder" });
  }
};

export const getFolders = async (req, res) => {
  try {
    const userId = req.user;
    const { parentId } = req.query;

    const folders = await listFoldersByUser(userId, parentId);
    res.json({ folders });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch folders" });
  }
};



// Soft delete a folder
export const deleteFolder = async (req, res) => {
  try {
    const { folderId } = req.params;
    const deleted = await softDeleteFolder(folderId);
    res.json({ message: "Folder moved to trash", folder: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Restore a folder
export const restoreFolderController = async (req, res) => {
  try {
    const { folderId } = req.params;
    const restored = await restoreFolder(folderId);
    res.json({ message: "Folder restored", folder: restored });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};