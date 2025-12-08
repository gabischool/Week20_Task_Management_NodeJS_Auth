export const requireRole = (...allowedRoles) => {
    return(req, res, next) => {
        if (!req.user || !req.role) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        if (!allowedRoles.includes(req.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied.`// Requered role: ${allowedRoles.join(" or ")}`,
            });

        }
        next()
    }
}
