import { User } from "../models/User.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { cleanText, validEmail } from "../utils/validation.js";

function publicUser(user) {
    return {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role
    };
}

async function startSession(req, user) {
    await new Promise((resolve, reject) => {
        req.session.regenerate(error => error ? reject(error) : resolve());
    });

    req.session.userId = String(user._id);

    await new Promise((resolve, reject) => {
        req.session.save(error => error ? reject(error) : resolve());
    });
}

export async function register(req, res, next) {
    try {
        const name = cleanText(req.body.name, 80);
        const email = validEmail(req.body.email);
        const password = String(req.body.password || "");

        if (name.length < 2) return res.status(400).json({ message: "Name must be at least 2 characters." });
        if (!email) return res.status(400).json({ message: "Enter a valid email address." });
        if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters." });

        const exists = await User.exists({ email });
        if (exists) return res.status(409).json({ message: "An account with that email already exists." });

        const user = await User.create({
            name,
            email,
            passwordHash: await hashPassword(password),
            role: "customer"
        });

        await startSession(req, user);
        res.status(201).json({ user: publicUser(user) });
    } catch (error) {
        next(error);
    }
}

export async function login(req, res, next) {
    try {
        const email = validEmail(req.body.email);
        const password = String(req.body.password || "");
        if (!email || !password) return res.status(400).json({ message: "Email and password are required." });

        const user = await User.findOne({ email });
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
            return res.status(401).json({ message: "Incorrect email or password." });
        }

        await startSession(req, user);
        res.json({ user: publicUser(user) });
    } catch (error) {
        next(error);
    }
}

export function me(req, res) {
    res.json({ user: req.user ? publicUser(req.user) : null });
}

export function logout(req, res, next) {
    req.session.destroy(error => {
        if (error) return next(error);
        res.clearCookie("eight.sid");
        res.json({ ok: true });
    });
}
