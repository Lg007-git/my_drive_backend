import { v4 as uuidv4, validate as isUUID } from "uuid";
import { insertFolder, listFoldersByUser } from "../models/folder.model.js";
import { softDeleteFolder, restoreFolder,deleteFolderById ,renameFolder} from "../models/folder.model.js";
import supabase from "../config/supabaseClient.js";

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

    const folders = await listFoldersByUser(userId, { parentFolderId: parentId || null});
    res.json({ folders });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch folders" });
  }
};



// Soft delete a folder
export const softdeleteFolder = async (req, res) => {
  
  try {
    console.log("Soft deleting folder:", req.params.folderId);
    const { folderId } = req.params;
    const deleted = await softDeleteFolder(folderId);
    res.json({ message: "Folder moved to trash", folder: deleted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const DeleteFolderById = async (req, res) => {
  
  try {
    // console.log("Deleting folder:", req.params.folderId);
    const { id } = req.params;
    console.log(id);
    const deleted = await deleteFolderById(id);
    res.json({ message: "Folder deleted", folder: deleted });
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

export const getTrashedFolders = async (req, res) => {
  try {
    const userId = req.user;

    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .eq("is_trashed", true)
      .order("deleted_at", { ascending: false });

    if (error) throw error;

    res.json({ folders: data });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch trashed folders" });
  }
};

export const renameFolderController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    const updated = await renameFolder(id, name);
    res.json({ message: "Folder renamed", folder: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};