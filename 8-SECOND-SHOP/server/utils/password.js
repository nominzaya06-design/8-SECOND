import crypto from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(crypto.scrypt);

export async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = await scrypt(password, salt, 64);
    return `${salt}:${Buffer.from(derivedKey).toString("hex")}`;
}

export async function verifyPassword(password, storedValue) {
    const [salt, storedHex] = String(storedValue || "").split(":");
    if (!salt || !storedHex) return false;

    const derivedKey = Buffer.from(await scrypt(password, salt, 64));
    const storedKey = Buffer.from(storedHex, "hex");
    return storedKey.length === derivedKey.length && crypto.timingSafeEqual(storedKey, derivedKey);
}
