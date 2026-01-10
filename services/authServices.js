import prisma from "../lib/prisma.js";



export async function getUserInfo(userID) { // User ID from token
    try {
        const user = await prisma.user.findUnique({
            where: { id: userID },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        return user;
    } catch (error) {
        throw new Error(`Error retrieving user info: ${error.message}`);
    }
}