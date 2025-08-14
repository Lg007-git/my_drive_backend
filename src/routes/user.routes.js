import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import supabase from "../config/supabaseClient.js";

const router = express.Router();


// Protected route example
router.get("/profile", protect, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, created_at")
      .eq("id", req.user.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
