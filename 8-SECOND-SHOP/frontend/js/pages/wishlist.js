import { accountNavigation } from "../components/account-nav.js";
import { renderProductGrid } from "../components/product-card.js";
import { getCurrentUser, getWishlist } from "../store.js";

export function renderWishlist(products) {
    if (!getCurrentUser()) {
        return `<main class="standard-page page-width"><div class="empty-state account-empty"><h1>Sign in to use your wishlist</h1><p>Your saved products are connected to your account.</p><a class="primary-button" href="#/login">Sign In</a></div></main>`;
    }

    const savedIds = getWishlist();
    const savedProducts = products.filter(product => savedIds.includes(product.id));

    return `<main class="standard-page page-width">
        <h1 class="page-title">My Account</h1>
        <div class="account-layout">
            ${accountNavigation("wishlist")}
            <section class="account-panel account-panel-wide">
                <h2>Wishlist</h2>
                ${savedProducts.length
                    ? `<div class="product-grid account-product-grid">${renderProductGrid(savedProducts)}</div>`
                    : `<div class="empty-state"><h2>Your wishlist is empty</h2><p>Save products with the heart button.</p><a class="primary-button" href="#/new-arrivals">Explore Products</a></div>`}
            </section>
        </div>
    </main>`;
}
