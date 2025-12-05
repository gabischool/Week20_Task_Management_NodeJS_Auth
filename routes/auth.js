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
    // 1. Validate the input
           const { name, email, password } = req.body;
           console.log(req.body)

    if (!name || !email || !password) { 
      return res.status(400).json({
        status: "failed",
        message: "You are missing required fields",
      });
    }    

    // 2. Check if the user already exists
 const alreadyExist = await prisma.user.findUnique({
      where: { email: email },
    });

    if (alreadyExist) {
      return res.status(400).json({
        status: "failed",
        message: "This user already exists in the database",
      });
    }


    // 3. Hash the password
     const hashedPassword = await bcrypt.hash(password, 10);


    // 4. Create the user
     const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });



    // 6. Return the user data and token
    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      user: newUser,
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
    // TODO: Implement the login logic
    // 1. Validate the input
      const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "failed",
        message: "Missing email or password",
      });
    }
    // 2. Check if the user exists
     const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({
        status: "failed",
        message: "Email does not exist",
      });
    }

    // 3. Compare the password
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Your password is incorrect",
      });
    }

    // 4. Generate a JWT token
  const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

   
    // 5. Return the user data and token
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        user: { id: user.id, name: user.name, email: user.email },
        token,
      },
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
