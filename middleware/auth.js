import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const authenticateToken = async (req, res, next) => {
  try {
    // TODO: Implement the authentication middleware
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res.status(401).json({ error: "No token provided" });

    // 1. Get the token from the request header

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Invalid token format" });
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mySecret");
    console.log("decoded payload", decoded);
    // 3. Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true }, // exclude password
    });
    // 4. If the user doesn't exist, throw an error
    if (!user) return res.status(401).json({ error: "User not found" });
    // 5. Attach the user to the request object
    req.user = user; // attach user to request
    next();
    // 6. Call the next middleware
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
