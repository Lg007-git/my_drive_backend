import supabase from "../config/supabaseClient.js";

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
