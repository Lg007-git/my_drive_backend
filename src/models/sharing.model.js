import supabase from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

export const shareFile = async ({ fileId, sharedBy, sharedWith, role }) => {
  const link = sharedWith ? null : uuidv4();

  const { data, error } = await supabase
    .from("shared_files")
    .insert([{ file_id: fileId, shared_by: sharedBy, shared_with: sharedWith || null, role, link }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getFilePermissions = async (fileId, userId) => {
  const { data, error } = await supabase
    .from("shared_files")
    .select("*")
    .or(`shared_with.eq.${userId},shared_by.eq.${userId}`)
    .eq("file_id", fileId);

  if (error) throw error;
  return data;
};
