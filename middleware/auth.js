import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticateToken = async (req, res, next) => {
  try {
    // TODO: Implement the authentication middleware

    // 1. Get the token from the request header
    const token = req.headers["authorization"]?.split(" ")[1]
    // 2. Verify the token
  
    const decodetoken = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    // 3. Get the user from the database
    const user = await prisma.user.findUnique({
      where: {id: decodetoken.userId},
      select:{
        id: true,
        name: true,
        email: true,
      


      }
    })
    // 4. If the user doesn't exist, throw an error
    if(!user) {
      return res.status(401).json({
        status: "fail",
        message: "user isnt exist",
        error: "error.message"
      })

    }
    // 5. Attach the user to the request object
    req.user = user
  


    // 6. Call the next middleware
    next()

    
    
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
