import supabase from "../config/supabaseClient.js";

// Insert a new folder
export async function insertFolder(folder) {
  const { data, error } = await supabase
    .from("folders")
    .insert([folder])
    .select()
    .single();
  if (error) throw error;
  return data;
}

// List folders by user (optionally by parent folder)
export async function listFoldersByUser(userId, { parentFolderId = null } = {}) {
  let query = supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (parentFolderId) query = query.eq("parent_folder_id", parentFolderId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Soft delete a folder (all files inside are also soft-deleted)
export async function softDeleteFolder(folderId) {
  // Delete folder
  const { data: folderData, error: folderError } = await supabase
    .from("folders")
    .update({ is_trashed: true, deleted_at: new Date() })
    .eq("id", folderId)
    .select()
    .single();
  if (folderError) throw folderError;

  // Delete all files inside folder
  const { error: fileError } = await supabase
    .from("files")
    .update({ is_trashed: true, deleted_at: new Date() })
    .eq("folder_id", folderId);
  if (fileError) throw fileError;

  return folderData;
}

// Restore folder (and files inside)
export async function restoreFolder(folderId) {
  const { data: folderData, error: folderError } = await supabase
    .from("folders")
    .update({ is_trashed: false, deleted_at: null })
    .eq("id", folderId)
    .select()
    .single();
  if (folderError) throw folderError;

  const { error: fileError } = await supabase
    .from("files")
    .update({ is_trashed: false, deleted_at: null })
    .eq("folder_id", folderId);
  if (fileError) throw fileError;

  return folderData;
}
