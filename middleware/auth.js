import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { User } from "lucide-react";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticateToken = async (req, res, next) => {
  try {
    // TODO: Implement the authentication middleware
    // 1. Get the token from the request header
    const authHeader=req.headers["authorization"];

    const token = authHeader && authHeader.split("")[1];

    if(!token) {
      return res.status(401).json({
        success:false,
        message:"Access token required",
      });
    }
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ttdtdtgulgytfdsassdfgkliop"  );
    // 3. Get the user from the database
    const user= await User.FindById(decoded.id);
    
    // 4. If the user doesn't exist, throw an error
    if(!user) {
      return res.status(404).json({
        success:false,
        message:"User not found",
      });
    }
    // 5. Attach the user to the request object
    req.task = decoded;
    // 6. Call the next middleware
    next();

    
    
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};
