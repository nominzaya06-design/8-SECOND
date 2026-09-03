import { accountNavigation } from "../components/account-nav.js";
import { AccountService } from "../account-service.js";
import { getCart, getCurrentUser } from "../store.js";
import { escapeHTML, formatPrice, showToast } from "../utils.js";

function cartRows(products) {
    return getCart().map(item => ({
        ...item,
        product: products.find(product => product.id === item.productId)
    })).filter(item => item.product);
}

export function renderCart(products) {
    if (!getCurrentUser()) {
        return `<main class="standard-page page-width"><div class="empty-state account-empty"><h1>Sign in to use your shopping bag</h1><p>Your bag is connected to your account.</p><a class="primary-button" href="#/login">Sign In</a></div></main>`;
    }

    const rows = cartRows(products);
    const subtotal = rows.reduce((sum, row) => sum + row.product.price * row.quantity, 0);

    const content = rows.length
        ? `<div class="cart-layout">
            <section class="cart-list" aria-label="Cart items">
                ${rows.map(row => `<article class="cart-item">
                    <a href="#/product/${row.product.id}"><img src="${escapeHTML(row.product.image)}" alt="${escapeHTML(row.product.name)}"></a>
                    <div>
                        <h2><a href="#/product/${row.product.id}">${escapeHTML(row.product.name)}</a></h2>
                        <p class="cart-meta">Color: <span class="cart-color-swatch" style="--swatch:${escapeHTML(row.color)}" aria-label="Selected color"></span> · Quantity: ${row.quantity}</p>
                        <div class="quantity-control small-control">
                            <button type="button" data-cart-minus="${row.productId}" ${row.quantity <= 1 ? "disabled" : ""}>−</button>
                            <span>${row.quantity}</span>
                            <button type="button" data-cart-plus="${row.productId}" ${row.quantity < row.product.stock ? "" : "disabled"}>+</button>
                        </div>
                        <button class="remove-link" type="button" data-cart-remove="${row.productId}">Remove</button>
                    </div>
                    <p class="cart-price">${formatPrice(row.product.price * row.quantity)}</p>
                </article>`).join("")}
            </section>

            <aside class="summary-card">
                <h2>Order Summary</h2>
                <div class="summary-row"><span>Subtotal</span><strong>${formatPrice(subtotal)}</strong></div>
                <div class="summary-row"><span>Shipping</span><strong>Free</strong></div>
                <div class="summary-row total"><span>Total</span><strong>${formatPrice(subtotal)}</strong></div>
                <a class="primary-button" href="#/checkout">Checkout</a>
            </aside>
        </div>`
        : `<div class="empty-state"><h2>Your bag is empty</h2><p>Explore the latest collection and add something you like.</p><a class="primary-button" href="#/new-arrivals">Shop New Arrivals</a></div>`;

    return `<main class="standard-page page-width">
        <h1 class="page-title">My Account</h1>
        <div class="account-layout">
            ${accountNavigation("cart")}
            <section class="account-panel account-panel-wide">
                <h2>Shopping Bag</h2>
                ${content}
            </section>
        </div>
    </main>`;
}

export function mountCart(products, rerender) {
    document.querySelector(".cart-list")?.addEventListener("click", async event => {
        const minus = event.target.closest("[data-cart-minus]");
        const plus = event.target.closest("[data-cart-plus]");
        const remove = event.target.closest("[data-cart-remove]");

        try {
            if (minus || plus) {
                const button = minus || plus;
                const productId = Number(button.dataset.cartMinus || button.dataset.cartPlus);
                const item = getCart().find(row => row.productId === productId);
                const product = products.find(product => product.id === item?.productId);

                if (item && product) await AccountService.updateCart(item.productId, item.quantity + (plus ? 1 : -1));
            }

            if (remove) await AccountService.removeCart(Number(remove.dataset.cartRemove));
            if (minus || plus || remove) await rerender();
        } catch (error) {
            showToast(error.message);
        }
    });
}
