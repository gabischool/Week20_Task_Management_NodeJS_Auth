import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
import { success } from "zod";
import { da, id } from "zod/v4/locales";
import bcryptjs from "bcryptjs";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// POST /api/auth/register - Register a new user
router.post("/register", async (req, res) => {
  try {
    // TODO: Implement the registration logic
    const { username, email, password, role} = req.body;
    // 1. Validate the input
    if (!username || !email || !password || !role) {
      console.log("Missing fields:", { username, email, password, role});
      return res.status(400).json({
        success: false,
        message: "Must provide username, email, password, and role."
      })
    }
    // 2. Check if the user already exists
    const user = await prisma.user.findUnique({
      where:{
        email: email,
      }
    })
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists."
      })
    }
    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 4. Create the user
   const newUser = await prisma.user.create({
    data: {
      name: username,
      email,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
   })
    // 5. Generate a JWT token
   const token = jwt.sign(
    {userId: newUser.id},
    JWT_SECRET,
    {expiresIn: "48h"}
   )
    // 6. Return the user data and token
    res.status(201).json({
      success: true,
      message: "User has been created!",
      data: {
        newUser,
        token
      }
    })
   



  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
});

// POST /api/auth/login - Login user
router.post("/login", async (req, res) => {
  try {
    // TODO: Implement the login logic
    // 1. Validate the input
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Must provide email and password."
      })
    }
    // 2. Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email: email 
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
      }
      })
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No user could be found."
      })
    }
    // 3. Compare the password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password."
      })
    }
    // 4. Generate a JWT token
    const token = jwt.sign(
    {userId: user.id},
    JWT_SECRET,
    {expiresIn: "48h"}
   )
    // 5. Return the user data and token
    res.status(200).json({
      success: true,
      message: "User has been verified. Welcome.",
      data: {
        user,
        token
      }
    })
    
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
});

// GET /api/auth/me - Get current user profile (protected route)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // req.user will be set by the authenticateToken middleware
    const { password, ...userWithoutPassword } = req.user;

    res.json({
      success: true,
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving user profile",
      error: error.message,
    });
  }
});

export default router;
