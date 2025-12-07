import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
// import { use } from "react";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// POST /api/auth/register - Register a new user
router.post("/register", async (req, res) => {
  try {
    // TODO: Implement the registration logic
    const {email, password, name} = req.body
    // 1. Validate the input
    if(!email || !password || !name){
      return res.status(201).json({
        status: "success",
        message: "registered succesfully",
      
      })
    }


     // 2. Check if the user already exists

     const isalreadyexists = await prisma.user.findUnique({
      where: {email: email}
     })




        if(isalreadyexists) {
      return res.status(400).json({
        status: "failed",
        message: "this user is already exists",
        error: "error.message"
      })
    }

   

    // 3. Hash the password
    const hashedpassoword  = await bcrypt.hash(password, 10)
    // 4. Create the user
    const newuser = await prisma.user.create({
      
      data: {
        email,
        password: hashedpassoword,
        name
      },
      select: {
        id: true,
        email: true,
        password: true,
        name: true
      }
    })





    // 5. Generate a JWT token
    const token = jwt.sign(
      {userId: newuser.id},
      process.env.JWT_SECRET || "secretkey",
      {expiresIn: "24h"}
    )
    // 6. Return the user data and token
    return res.status(201).json({
      status: "success",
      message: "registred succesfully",
      token,
      user: newuser,
     



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
    const {email, password} = req.body
    // 1. Validate the input
    if(!email || !password) {
      return res.status(401).json({
        status: "fail",
        message: "input is missing all input is required",
        error: error.message
      })
    }
    // 2. Check if the user exists
    const user = await prisma.user.findUnique({
      where: {email: email}
    })

    if(!user){
       return res.status(400).json({
        success: false,
        message: "this user isnt exst"
      })


    }
    // 3. Compare the password
    const passowordcorrect = await bcrypt.compare(password, user.password)

    if(passowordcorrect == false){
      return res.status(402).json({
        success: false,
        message: "invalid passowor or email"
      })
    }
    // 4. Generate a JWT token
    const token = jwt.sign(
      {userId: user.id},
      process.env.JWT_SECRET || "secretkey",
      {expiresIn: "24h"}
    )
    // 5. Return the user data and token
    const {password: _, ...userinfo} = user



    return res.status(201).json({
      status: "success",
      message: "your login is succesfull",
      data: {
        user: userinfo,
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
