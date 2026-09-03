import { getWishlist } from "../store.js";

function icon(name) {
    const icons = {
        search: '<circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path>',
        user: '<circle cx="12" cy="8" r="3"></circle><path d="M6.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6"></path>',
        heart: '<path d="M20.7 5.9c-1.8-2-5-1.7-6.7.3L12 8.5l-2-2.3c-1.7-2-4.9-2.3-6.7-.3-1.9 2.1-1.7 5.3.3 7.2L12 21l8.4-7.9c2-1.9 2.2-5.1.3-7.2Z"></path>',
        bag: '<path d="M6 8h12l-1 12H7L6 8Z"></path><path d="M9 8V6a3 3 0 0 1 6 0v2"></path>',
        home: '<path d="M3 11.5 12 4l9 7.5V21h-6v-6H9v6H3v-9.5Z"></path>'
    };

    return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]}</svg>`;
}

function active(routeName, names) {
    return names.includes(routeName) ? "active" : "";
}

export function renderHeader(route) {
    const wishlistCount = getWishlist().length;

    return `<header class="site-header">
        <nav class="nav-container" aria-label="Main navigation">
            <a class="logo" href="#/home">8 SECONDS</a>

            <ul class="nav-links">
                <li><a class="${active(route.name, ["women"])}" href="#/women">Women</a></li>
                <li><a class="${active(route.name, ["men"])}" href="#/men">Men</a></li>
                <li><a class="${active(route.name, ["new"])}" href="#/new-arrivals">New Arrivals</a></li>
                <li><a class="${active(route.name, ["best"])}" href="#/best">Best</a></li>
                <li><a class="sale-link ${active(route.name, ["sale"])}" href="#/sale">Sale</a></li>
            </ul>

            <div class="nav-actions">
                <a href="#/search" aria-label="Search">${icon("search")}</a>
                <a class="desktop-action" href="#/profile" aria-label="Profile">${icon("user")}</a>
                <a class="desktop-action action-with-badge" href="#/wishlist" aria-label="Wishlist">
                    ${icon("heart")}
                    <span class="nav-badge" data-wishlist-badge ${wishlistCount ? "" : "hidden"}>${wishlistCount}</span>
                </a>
                <a class="action-with-badge" href="#/cart" aria-label="Shopping bag">
                    ${icon("bag")}
                    <cart-badge></cart-badge>
                </a>
            </div>
        </nav>
    </header>`;
}

export function renderMobileNav(route) {
    const tabs = [
        ["home", "#/home", "home", "Home"],
        ["search", "#/search", "search", "Search"],
        ["wishlist", "#/wishlist", "heart", "Wishlist"],
        ["cart", "#/cart", "bag", "Cart"],
        ["profile", "#/profile", "user", "Profile"]
    ];

    return `<nav class="mobile-tabs" aria-label="Mobile navigation">
        ${tabs.map(([name, href, iconName, label]) => `
            <a class="${route.name === name ? "active" : ""}" href="${href}">
                ${icon(iconName)}
                <span>${label}</span>
            </a>`).join("")}
    </nav>`;
}
