import "./components/cart-badge.js";
import { AuthService } from "./auth-service.js";
import { AccountService } from "./account-service.js";
import { ProductService } from "./data.js";
import { getRoute } from "./router.js";
import { renderHeader, renderMobileNav } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { getCurrentUser, getWishlist } from "./store.js";
import { showToast } from "./utils.js";
import { renderHome, mountHome } from "./pages/home.js";
import { renderShop, mountShop } from "./pages/shop.js";
import { renderProduct, mountProduct } from "./pages/product.js";
import { renderCart, mountCart } from "./pages/cart.js";
import { renderCheckout, mountCheckout } from "./pages/checkout.js";
import { renderWishlist } from "./pages/wishlist.js";
import { renderSearch, mountSearch } from "./pages/search.js";
import { renderAuth, mountAuth } from "./pages/auth.js";
import { renderProfile, mountProfile } from "./pages/profile.js";
import { renderOrders, mountOrders } from "./pages/orders.js";
import { renderAdmin, mountAdmin } from "./pages/admin.js";
import { renderNotFound } from "./pages/not-found.js";

const app = document.querySelector("#app");

function pageFor(route, products) {
    if (route.name === "home") return { html: renderHome(products), mount: mountHome };
    if (["women", "men", "new", "best", "sale"].includes(route.name)) return { html: renderShop(route), mount: () => mountShop(route, products) };

    if (route.name === "product") {
        const product = ProductService.find(route.params.id);
        return { html: renderProduct(product, products), mount: () => mountProduct(product) };
    }

    if (route.name === "cart") return { html: renderCart(products), mount: () => mountCart(products, renderRoute) };
    if (route.name === "checkout") return { html: renderCheckout(products), mount: () => mountCheckout(products) };
    if (route.name === "wishlist") return { html: renderWishlist(products) };
    if (route.name === "search") return { html: renderSearch(route), mount: () => mountSearch(route, products) };
    if (["login", "register"].includes(route.name)) return { html: renderAuth(route), mount: () => mountAuth(route) };
    if (route.name === "profile") return { html: renderProfile(), mount: mountProfile };
    if (route.name === "orders") return { html: renderOrders(), mount: mountOrders };
    if (route.name === "admin") return { html: renderAdmin(products), mount: () => mountAdmin(products, renderRoute) };
    return { html: renderNotFound() };
}

function updateWishlistBadges() {
    const count = getWishlist().length;
    document.querySelectorAll("[data-wishlist-badge]").forEach(badge => {
        badge.textContent = count;
        badge.hidden = count === 0;
    });
}

function updateWishlistButton(button, added) {
    button.classList.toggle("active", added);
    button.setAttribute("aria-pressed", String(added));
    button.setAttribute("aria-label", `${added ? "Remove from" : "Add to"} wishlist`);
}

document.addEventListener("shop:statechange", updateWishlistBadges);

app.addEventListener("click", async event => {
    const button = event.target.closest("[data-wishlist]");
    if (!button) return;

    event.preventDefault();
    event.stopPropagation();

    if (!getCurrentUser()) {
        showToast("Please sign in to use your wishlist.");
        location.hash = "#/login";
        return;
    }

    const id = Number(button.dataset.wishlist);
    if (button.dataset.pending === "true") return;

    const wasAdded = button.classList.contains("active");
    button.dataset.pending = "true";
    updateWishlistButton(button, !wasAdded);

    try {
        const added = await AccountService.toggleWishlist(id);
        updateWishlistButton(button, added);
        showToast(added ? "Saved to wishlist." : "Removed from wishlist.");

        if (getRoute().name === "wishlist") renderRoute();
    } catch (error) {
        updateWishlistButton(button, wasAdded);
        showToast(error.message);
    } finally {
        delete button.dataset.pending;
    }
});

const titles = {
    home: "8 Seconds Clothing Shop",
    women: "Women",
    men: "Men",
    new: "New Arrivals",
    best: "Best Sellers",
    sale: "Sale",
    product: "Product",
    search: "Search",
    wishlist: "Wishlist",
    cart: "Shopping Bag",
    checkout: "Checkout",
    login: "Sign In",
    register: "Create Account",
    profile: "My Account",
    orders: "Orders",
    admin: "Admin"
};

export async function renderRoute() {
    try {
        const route = getRoute();
        const [user, products] = await Promise.all([
            AuthService.restoreSession(),
            ProductService.load()
        ]);
        if (user) await AccountService.load();
        else AccountService.reset();
        const page = pageFor(route, products);

        app.innerHTML = `${renderHeader(route)}${page.html}${renderFooter()}${renderMobileNav(route)}`;
        window.scrollTo({ top: 0, behavior: "instant" });
        page.mount?.();

        document.title = route.name === "home"
            ? titles.home
            : `${titles[route.name] || "Page"} · 8 Seconds`;
    } catch (error) {
        console.error(error);
        app.innerHTML = `<main class="standard-page page-width"><div class="empty-state"><h1>Something went wrong</h1><p>Please try again.</p></div></main>`;
    }
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("DOMContentLoaded", () => {
    if (!location.hash) location.hash = "#/home";
    else renderRoute();
});
