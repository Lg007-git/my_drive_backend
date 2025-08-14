import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/private", protect, (req, res) => {
  res.json({
    message: "You have access to this protected route",
    userId: req.user.id
  });
});

export default router;
