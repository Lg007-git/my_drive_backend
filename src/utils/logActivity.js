import supabase from "../config/supabaseClient.js";

export const logActivity = async (userId, fileId, action) => {
  const { error } = await supabase
    .from("activity_logs")
    .insert([{ user_id: userId, file_id: fileId, action }]);

  if (error) console.error("Activity log error:", error.message);
};
