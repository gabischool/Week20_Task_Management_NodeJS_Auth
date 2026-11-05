import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// POST /api/auth/register - Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password} = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }
    const existingUser = await prisma.user.findUnique({
      where: { email} ,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({

      data:{
        name,
        email,
        password: hashedPassword,

      },
      select:{
        id: true,
        name: true,
        email: true,
      },

    })

    const token = jwt.sign({ userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h"}
    
    );

    return res.status(201).json({
      success: true,
      user,
      token,

    });
    


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
    
    const { email, password } = req.body;

    if (!email || !password ) {

      return res.status(400).json({

        success: false,
        message: "Email and Password are required",
      });
    }


    const user = await prisma.user.findUnique({
      where: { email},
    });

    if(!user) {

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }


    const isPasswordValid = await bcrypt.compare(
      password, 
      user.password 

    );

    if(!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h"}

    );


    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
    
    
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
