import prisma from "../lib/prisma.js";

// Simpler approach - just get all tasks
export async function getAllTasks(userId) {
  return await prisma.task.findMany({
    where: { userId },
    include: { subtasks: true },
    orderBy: { createdAt: "desc" },
  });
}

// Get task by ID
export async function getTaskById(id, userId) {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
      include: { subtasks: true },
    });

    if (!task) {
      throw new Error("Task not found");
    }

    return task;
  } catch (error) {
    throw new Error(`Error retrieving task: ${error.message}`);
  }
}

// Create new task
export async function createTask(taskData, userId) {
  try {
    // Convert status from kebab-case to snake_case for Prisma enum
    const status =
      taskData.status === "in-progress" ? "in_progress" : taskData.status;

    const task = await prisma.task.create({
      data: {
        title: taskData.title,
        description: taskData.description,
        status: status,
        priority: taskData.priority,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
        assignedTo: taskData.assignedTo,
        userId: userId,
        subtasks: {
          create: taskData.subtasks || [],
        },
      },
      include: {
        subtasks: true,
      },
    });

    return task;
  } catch (error) {
    throw new Error(`Error creating task: ${error.message}`);
  }
}





// Update task
export async function updateTask(id, updateData, userId) {
  try {
    // Check if task exists
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTask) {
      throw new Error("Task not found");
    }

    // Convert status from kebab-case to snake_case for Prisma enum
    if (updateData.status && updateData.status === "in-progress") {
      updateData.status = "in_progress";
    }

    // Handle dueDate conversion
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        subtasks: true,
      },
    });

    return task;
  } catch (error) {
    throw new Error(`Error updating task: ${error.message}`);
  }
}

// Delete task
export async function deleteTask(id, userId) {
  try {
    // Check if task exists
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        subtasks: true,
      },
    });

    if (!existingTask) {
      throw new Error("Task not found");
    }

    // Delete the task (subtasks will be deleted automatically due to cascade)
    await prisma.task.delete({
      where: { id },
    });

    return existingTask;
  } catch (error) {
    throw new Error(`Error deleting task: ${error.message}`);
  }
}

// Create subtask
export async function createSubtask(taskId, subtaskData, userId) {
  try {
    // First verify the task belongs to the user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      throw new Error("Task not found or access denied");
    }

    const subtask = await prisma.subtask.create({
      data: {
        title: subtaskData.title,
        description: subtaskData.description,
        completed: subtaskData.completed || false,
        taskId: taskId,
      },
    });

    return subtask;
  } catch (error) {
    throw new Error(`Error creating subtask: ${error.message}`);
  }
}

// Update subtask
export async function updateSubtask(id, updateData, userId) {
  try {
    // First verify the subtask belongs to a task owned by the user
    const subtask = await prisma.subtask.findFirst({
      where: {
        id,
        task: {
          userId,
        },
      },
      include: {
        task: true,
      },
    });

    if (!subtask) {
      throw new Error("Subtask not found or access denied");
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id },
      data: updateData,
    });

    return updatedSubtask;
  } catch (error) {
    throw new Error(`Error updating subtask: ${error.message}`);
  }
}

// Delete subtask
export async function deleteSubtask(id, userId) {
  try {
    // First verify the subtask belongs to a task owned by the user
    const subtask = await prisma.subtask.findFirst({
      where: {
        id,
        task: {
          userId,
        },
      },
      include: {
        task: true,
      },
    });

    if (!subtask) {
      throw new Error("Subtask not found or access denied");
    }

    const deletedSubtask = await prisma.subtask.delete({
      where: { id },
    });

    return deletedSubtask;
  } catch (error) {
    throw new Error(`Error deleting subtask: ${error.message}`);
  }
}

// Get subtask by ID
export async function getSubtaskById(id, userId) {
  try {
    const subtask = await prisma.subtask.findFirst({
      where: {
        id,
        task: {
          userId,
        },
      },
      include: {
        task: true,
      },
    });

    if (!subtask) {
      throw new Error("Subtask not found or access denied");
    }

    return subtask;
  } catch (error) {
    throw new Error(`Error retrieving subtask: ${error.message}`);
  }
}

// Get all subtasks for a specific task
export async function getSubtasksByTaskId(taskId, userId) {
  try {
    // First verify the task belongs to the user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      throw new Error("Task not found or access denied");
    }

    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { createdAt: "asc" },
    });

    return subtasks;
  } catch (error) {
    throw new Error(`Error retrieving subtasks: ${error.message}`);
  }
}
