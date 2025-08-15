import supabase from "../config/supabaseClient.js";

export const getActivityLogs = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*, files(name)")
      .eq("user_id", req.user.id)
      .order("timestamp", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
