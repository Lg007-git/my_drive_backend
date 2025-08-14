import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("🚀 Google Drive Clone Backend is running"));

// Test Route
app.use("/test", testRoutes);
app.use("/auth", authRoutes);
app.use("/files", fileRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
