import express from "express";
import dotenv from "dotenv";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();
const app = express();

app.use(express.json());

// Test Route
app.use("/api", testRoutes);
app.use("/auth", authRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
