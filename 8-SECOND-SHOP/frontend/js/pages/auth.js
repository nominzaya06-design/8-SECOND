import { AuthService } from "../auth-service.js";
import { getCurrentUser } from "../store.js";
import { escapeHTML, showToast } from "../utils.js";

export function renderAuth(route) {
    const register = route.name === "register";
    const user = getCurrentUser();

    if (user) {
        return `<main class="auth-page">
            <section class="auth-card">
                <h1>Already signed in</h1>
                <p class="page-subtitle">Signed in as ${escapeHTML(user.email)}.</p>
                <a class="primary-button" href="#/profile">Go to My Account</a>
            </section>
        </main>`;
    }

    return `<main class="auth-page">
        <section class="auth-card">
            <h1>${register ? "Create Account" : "Sign In"}</h1>
            <p class="page-subtitle">Your account is authenticated by the Node/Express server.</p>

            <form id="auth-form">
                ${register ? `<div class="field"><label for="auth-name">Name</label><input id="auth-name" name="name" minlength="2" maxlength="80" required></div>` : ""}
                <div class="field"><label for="auth-email">Email</label><input id="auth-email" name="email" type="email" autocomplete="email" required></div>
                <div class="field"><label for="auth-password">Password</label><input id="auth-password" name="password" type="password" minlength="8" autocomplete="${register ? "new-password" : "current-password"}" required></div>
                <button class="primary-button" type="submit">${register ? "Create Account" : "Sign In"}</button>
            </form>

            <p class="auth-switch">${register ? "Already have an account?" : "New here?"} <a class="text-link" href="${register ? "#/login" : "#/register"}">${register ? "Sign in" : "Create account"}</a></p>
        </section>
    </main>`;
}

export function mountAuth(route) {
    const form = document.querySelector("#auth-form");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const button = form.querySelector("button[type='submit']");
        const data = new FormData(form);
        const payload = {
            email: String(data.get("email") || "").trim(),
            password: String(data.get("password") || "")
        };

        if (route.name === "register") {
            payload.name = String(data.get("name") || "").trim();
        }

        button.disabled = true;

        try {
            if (route.name === "register") await AuthService.register(payload);
            else await AuthService.login(payload);

            showToast(route.name === "register" ? "Account created." : "Signed in.");
            location.hash = "#/profile";
        } catch (error) {
            showToast(error.message);
        } finally {
            button.disabled = false;
        }
    });
}
