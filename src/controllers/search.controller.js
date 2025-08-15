// controllers/search.controller.js
import supabase from "../config/supabaseClient.js";

export const searchFilesController = async (req, res) => {
  const userId = req.user;
  const { q, type, startDate, endDate } = req.query;

  try {
    let query = supabase
      .from("files")
      .select("*")
      .or(`owner.eq.${userId},shared_with.eq.${userId}`);

    if (q) query = query.ilike("name", `%${q}%`);
    if (type) query = query.eq("type", type);
    if (startDate && endDate) {
      query = query.gte("created_at", startDate).lte("created_at", endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
