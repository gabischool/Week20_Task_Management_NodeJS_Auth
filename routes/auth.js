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
    // TODO: Implement the registration logic
    const { email, password, name } = req.body
    
    // 1. Validate the input
    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'failed',
        message: 'You are missing required field, all fields are required'
      })
    }

    // 2. Check if the user already exists
      const existsUser = await prisma.user.findUnique({
        where: { email: email}
      })
     
      if (existsUser) {
        return res.status(400).json({
          status: "failed",
          "message": "This user already exists in the database"
        })
      }
      
    // 3. Hash the password
     const hashPassword = await bcrypt.hash(password, 10)

    // 4. Create the user
     const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashPassword,
       
      
      },
      select: {
        id: true,
        name: true,
        email: true

      }
     })
     
    // 5. Generate a JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "24h" }
    );
    
    // 6. Return the user data and token
     res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: newUser,
      token})
    


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
    const { email, password} = req.body
    
    // 1. Validate the input
    if (!email || !password) {
      return res.status(400).json({
        status: 'failed',
        message: 'You are missing required field, all fields are required'
      })
    }
    // 2. Check if the user exists
    const user = await prisma.user.findUnique({
      where: { email: email }
    })
   
    if (!user) {
      return res.status(400).json({
        status: "failed",
        "message": "This email does not exists in the database"
      })
    }
    // 3. Compare the password
    const iscomparePassword = await bcrypt.compare(password, user.password)

    if (iscomparePassword == false) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      })
    }

    // 4. Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "24h" }
    );

    const {password: _, ...userInfo } = user
    
    // 5. Return the user data and token
    res.status(201).json({
      status: "success",
      message: "User logged in successfully",
      data: {
        user: userInfo,
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
