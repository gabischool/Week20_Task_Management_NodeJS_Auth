import { PrismaClient } from "@prisma/client";


// const prisma = new PrismaClient()

// Create a global variable to store the Prisma client instance
// This prevents multiple instances during development with hot reload
const globalForPrisma = globalThis;

// Initialize Prisma client
const prisma = globalForPrisma.prisma || new PrismaClient();

// In development, store the instance globally to prevent multiple instances
if (process.env.NODE_ENV === "development") {
  globalForPrisma.prisma = prisma;
}

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
