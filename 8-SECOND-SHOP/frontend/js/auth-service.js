import { apiFetch } from "./api.js";
import { clearCurrentUser, getCurrentUser, setCurrentUser } from "./store.js";

let sessionChecked = false;

export class AuthService {
    static async restoreSession(force = false) {
        if (sessionChecked && !force) return getCurrentUser();

        try {
            const data = await apiFetch("/api/auth/me");
            setCurrentUser(data.user || null);
        } catch {
            clearCurrentUser();
        }

        sessionChecked = true;
        return getCurrentUser();
    }

    static async register(payload) {
        const data = await apiFetch("/api/auth/register", { method: "POST", body: payload });
        setCurrentUser(data.user);
        sessionChecked = true;
        return data.user;
    }

    static async login(payload) {
        const data = await apiFetch("/api/auth/login", { method: "POST", body: payload });
        setCurrentUser(data.user);
        sessionChecked = true;
        return data.user;
    }

    static async logout() {
        try {
            await apiFetch("/api/auth/logout", { method: "POST" });
        } finally {
            clearCurrentUser();
            sessionChecked = true;
        }
    }
}
