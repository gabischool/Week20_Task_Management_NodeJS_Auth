import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { success } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticateToken = async (req, res, next) => {
  try {
    // TODO: Implement the authentication middleware
    // 1. Get the token from the request header
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }
    // 2. Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No student found."
      })
    }
    // 4. If the user doesn't exist, throw an error
    // 5. Attach the user to the request object
    req.user = user;
    req.role = user.role;
    // 6. Call the next middleware
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
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
      error: error.message
    });
  }
};
