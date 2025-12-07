import express from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  getSubtaskById,
  getSubtasksByTaskId,
} from "../services/taskServices.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(authenticateToken);

// GET /api/tasks - Get all tasks for the authenticated user
// This route handles GET requests to /api/tasks
// req = request object (contains data sent by client)
// res = response object (used to send data back to client)
router.get("/tasks", authenticateToken, async (req, res) => {
  try {
    const tasks = await getAllTasks(req.user.id);

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /api/tasks/:id - Get task by ID for the authenticated user
// :id is a route parameter - it captures the value from the URL
// Example: /api/tasks/1 will set req.params.id = "1"
router.get("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // Extract the ID from the URL
    const task = await getTaskById(id, req.user.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found",
      }); // 404 = Not Found
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    }); // 500 = Server Error
  }
});

// POST /api/tasks - Create new task for the authenticated user
// POST requests are used to create new resources
// req.body contains the data sent in the request body
router.post("/tasks", authenticateToken, async (req, res) => {
  try {
    const taskData = req.body;
    const newTask = await createTask(taskData, req.user.id);

    res.status(201).json({
      success: true,
      data: newTask,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    }); // 400 = Bad Request for validation errors
  }
});

// PUT /api/tasks/:id - Update task for the authenticated user
// PUT requests are used to update existing resources
// The entire resource is replaced with the new data
router.put("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedTask = await updateTask(id, updateData, req.user.id);

    res.json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    if (error.message === "Task not found") {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
});

// DELETE /api/tasks/:id - Delete task for the authenticated user
// DELETE requests are used to remove resources
router.delete("/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await deleteTask(id, req.user.id);

    res.json({
      success: true,
      data: deletedTask,
    });
  } catch (error) {
    if (error.message === "Task not found") {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
});

// ===== SUBTASK ROUTES =====

// GET /api/tasks/:taskId/subtasks - Get all subtasks for a specific task
router.get("/tasks/:taskId/subtasks", async (req, res) => {
  try {
    const { taskId } = req.params;
    const subtasks = await getSubtasksByTaskId(taskId, req.user.id);

    res.json({
      success: true,
      count: subtasks.length,
      data: subtasks,
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("access denied")
    ) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
});

// GET /api/subtasks/:id - Get subtask by ID
router.get("/subtasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const subtask = await getSubtaskById(id, req.user.id);

    res.json({
      success: true,
      data: subtask,
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("access denied")
    ) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
});

// POST /api/tasks/:taskId/subtasks - Create new subtask for a specific task
router.post("/tasks/:taskId/subtasks", async (req, res) => {
  try {
    const { taskId } = req.params;
    const subtaskData = req.body;
    const newSubtask = await createSubtask(taskId, subtaskData, req.user.id);

    res.status(201).json({
      success: true,
      data: newSubtask,
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("access denied")
    ) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
});

// PUT /api/subtasks/:id - Update subtask
router.put("/subtasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedSubtask = await updateSubtask(id, updateData, req.user.id);

    res.json({
      success: true,
      data: updatedSubtask,
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("access denied")
    ) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
});

// DELETE /api/subtasks/:id - Delete subtask
router.delete("/subtasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubtask = await deleteSubtask(id, req.user.id);

    res.json({
      success: true,
      data: deletedSubtask,
    });
  } catch (error) {
    if (
      error.message.includes("not found") ||
      error.message.includes("access denied")
    ) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
});

export default router;
