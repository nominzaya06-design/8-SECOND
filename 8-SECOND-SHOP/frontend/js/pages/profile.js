import { accountNavigation } from "../components/account-nav.js";
import { AuthService } from "../auth-service.js";
import { OrderService } from "../order-service.js";
import { getCartCount, getCurrentUser, getWishlist } from "../store.js";
import { escapeHTML, showToast } from "../utils.js";

export function renderProfile() {
    const user = getCurrentUser();

    if (!user) {
        return `<main class="standard-page page-width"><div class="empty-state account-empty"><h1>My Account</h1><p>Sign in to view your account and orders.</p><div class="inline-actions center-actions"><a class="primary-button" href="#/login">Sign In</a><a class="secondary-button" href="#/register">Create Account</a></div></div></main>`;
    }

    return `<main class="standard-page page-width">
        <h1 class="page-title">My Account</h1>
        <div class="account-layout">
            ${accountNavigation("profile")}
            <section class="account-panel">
                <h2>Welcome, ${escapeHTML(user.name)}</h2>
                <p class="page-subtitle">${escapeHTML(user.email)} · ${escapeHTML(user.role)}</p>

                <div class="dashboard-cards">
                    <a class="dashboard-card" href="#/orders"><strong id="profile-order-count">—</strong><span>Orders</span></a>
                    <a class="dashboard-card" href="#/wishlist"><strong>${getWishlist().length}</strong><span>Wishlist</span></a>
                    <a class="dashboard-card" href="#/cart"><strong>${getCartCount()}</strong><span>Bag Items</span></a>
                </div>

                <div class="inline-actions profile-actions">
                    ${user.role === "admin" ? `<a class="primary-button" href="#/admin">Open Admin</a>` : ""}
                    <button class="secondary-button account-logout" id="logout-button" type="button">Sign Out</button>
                </div>
            </section>
        </div>
    </main>`;
}

export function mountProfile() {
    const user = getCurrentUser();
    if (!user) return;

    OrderService.list()
        .then(orders => {
            const count = document.querySelector("#profile-order-count");
            if (count) count.textContent = orders.length;
        })
        .catch(() => {
            const count = document.querySelector("#profile-order-count");
            if (count) count.textContent = "0";
        });

    document.querySelector("#logout-button")?.addEventListener("click", async () => {
        try {
            await AuthService.logout();
            showToast("Signed out.");
            location.hash = "#/home";
        } catch (error) {
            showToast(error.message);
        }
    });
}
