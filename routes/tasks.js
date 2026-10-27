import express from "express";
import prisma from "../lib/prisma.js";

const router = express.Router();

// ============ MAKE CHANGE HERE ============
// TODO: GET /api/my-tasks
router.get("/my-tasks", async (req, res) => {
  try {
    // 1. Import authenticateToken from middleware/auth.js
    // 2. Add it to this route
    // 3. Use prisma to get tasks where userId is req.user.id
    // 4. Send those tasks back

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
