import express from "express";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// ============ MAKE CHANGE HERE ============
// TODO: GET /api/my-tasks
router.get("/my-tasks", authenticateToken, async (req, res) => {
  try {

    const tasks = await prisma.task.findMany({
      where: {

        userId: req.user.id,

      },
    });

    res.json( tasks);

    
 

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
