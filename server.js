import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// Import routes
import taskRoutes from "./routes/tasks.js";
import authRoutes from "./routes/auth.js";
import generateRoutes from "./routes/generate.js";
import { authenticateToken } from "./middleware/auth.js";

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api", taskRoutes);

app.use("/api/generate", generateRoutes);

// Protected route example
app.get("/api/protected", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "This is a protected route",
    user: req.user,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler for undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
