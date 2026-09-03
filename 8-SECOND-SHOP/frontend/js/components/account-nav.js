export function accountNavigation(active) {
    const links = [
        ["profile", "#/profile", "Overview"],
        ["orders", "#/orders", "Orders"],
        ["wishlist", "#/wishlist", "Wishlist"],
        ["cart", "#/cart", "Shopping Bag"]
    ];

    return `<nav class="account-nav" aria-label="Account navigation">
        ${links.map(([name, href, label]) =>
            `<a class="${active === name ? "active" : ""}" href="${href}">${label}</a>`
        ).join("")}
    </nav>`;
}
