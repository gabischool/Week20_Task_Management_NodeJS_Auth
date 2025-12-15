import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yfwelweofweour-secresfnkgskrt-keyefefefnkaefae";

// POST /api/auth/register -  a new user
router.post("/register", async (req, res) => {
  try {
    // TODO: Implement the registration logic

    //extract data from the req.body

    const {name, email, password} = req.body
    // 1. Validate the input
1
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "missed required fields"
      }) 
    }
    // 2. Check if the user already exists

    const isAlreadyExistsUser = await prisma.user.findUnique({
      where: {email}
    })

    if (isAlreadyExistsUser ) {
      return res.status(400).json({
        success: false,
        message: "user already exists"
      })
    }
    // 3. Hash the password

    const hashedPassword = await bcrypt.hash(password, 10)
    // 4. Create the user

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword,},
      select: {id: true, name: true, email: true}
    })
    // 5. Generate a JWT token

    const token = jwt.sign(
      {userId: newUser.id},
      process.env.JWT_SECRET || "yfwelweofweour-secresfnkgskrt-keyefefefnkaefae",
      {expiresIn: "1h"}
     )
    // 6. Return the user data and token

    return res.status(201).json({
      success: true,
      user: newUser,
      message: "user registered successfully",
      token
     
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

    // 1. extract data from the req.body and  Validate the input

    const {email, password} =  req.body
        
    if (!email || !password) {
     return res.status(400).json({
      success: false,
      message: "missed required fields, please check your email or password is accurate"
     })
    }
    // 2. Check if the user exists


    const isUserExists = await prisma.user.findUnique({
    where: {email},
    select: {
    id: true,
    email: true,
    name: true,
    password: true,
    createdAt: true,
    updatedAt: true,
    }
    })
  

  

    if (!isUserExists) {
      return res.status(400).json({
        success: false,
        message: "email does not registered signUp now"
      })
    }
    // 3. Compare the password

    const isPasswordCorrect  = await bcrypt.compare(password, isUserExists.password)
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "invalid password"
      })
    }
    // 4. Generate a JWT token

    const token = jwt.sign(
      {id: isUserExists.id},
      process.env.JWT_SECRET,
      {expiresIn: "23h"}
    )
    // 5. Return the user data and token

    const { password:_, ...userInfo } = isUserExists;


    return res.status(201).json({
      success: true,
      message: "user login... successfuly",
      data: {
      id: isUserExists.id,
      isUserExists: userInfo,
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

app.us

export default router;
