import supabase from "../config/supabaseClient.js";

export async function getFileById(fileId, userId) {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data;
}

export async function insertFileMeta(meta) {
  const { data, error } = await supabase
    .from("files")
    .insert([meta])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listFilesByUser(userId, { folderId = null, limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .eq("is_trashed", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (folderId) query = query.eq("folder_id", folderId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Soft delete a file
export async function softDeleteFile(fileId,userId) {
  const { data, error } = await supabase
    .from("files")
    .update({ is_trashed: true, deleted_at: new Date().toISOString()  })
    .eq("id", fileId)
    .eq("user_id", userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Restore a file
export async function restoreFile(fileId, userId) {
  const { data, error } = await supabase
    .from("files")
    .update({ is_trashed: false, deleted_at: null })
    .eq("id", fileId)
    .eq("user_id", userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function hardDeleteFile(fileId, userId) {
  const { data, error } = await supabase
    .from("files")
    .delete()
    .eq("id", fileId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}