import { User } from "../models/User.js";

export async function attachUser(req, _res, next) {
    try {
        req.user = null;
        if (req.session?.userId) {
            req.user = await User.findById(req.session.userId).select("name email role").lean();
            if (!req.user) delete req.session.userId;
        }
        next();
    } catch (error) {
        next(error);
    }
}

export function requireAuth(req, res, next) {
    if (!req.user) return res.status(401).json({ message: "Please sign in first." });
    next();
}

export function requireAdmin(req, res, next) {
    if (!req.user) return res.status(401).json({ message: "Please sign in first." });
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required." });
    next();
}
