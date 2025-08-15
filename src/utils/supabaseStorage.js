import supabase from "../config/supabaseClient.js";

export const getSignedUrl = async (bucket, path, expires = 60) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expires); // expires in seconds

  if (error) throw error;
  return data.signedUrl;
};
