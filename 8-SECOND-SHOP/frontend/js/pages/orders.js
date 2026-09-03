import { accountNavigation } from "../components/account-nav.js";
import { OrderService } from "../order-service.js";
import { getCurrentUser } from "../store.js";
import { escapeHTML, formatDate, formatPrice } from "../utils.js";

function orderCards(orders) {
    if (!orders.length) {
        return `<div class="empty-state"><h2>No orders yet</h2><p>Your completed orders will appear here.</p><a class="primary-button" href="#/new-arrivals">Start Shopping</a></div>`;
    }

    return orders.map(order => `<article class="order-card">
        <header class="order-head">
            <div><strong>${escapeHTML(order.orderNumber)}</strong><br><span>${escapeHTML(formatDate(order.createdAt))}</span></div>
            <span class="status-pill">${escapeHTML(order.status)}</span>
        </header>
        <div class="order-body">
            ${order.items.map(item => `<div class="order-item-line"><span>${escapeHTML(item.name)} × ${item.quantity} <span class="cart-color-swatch" style="--swatch:${escapeHTML(item.color)}" aria-label="Selected color"></span></span><strong>${formatPrice(item.price * item.quantity)}</strong></div>`).join("")}
            <div class="summary-row total"><span>Total</span><strong>${formatPrice(order.total)}</strong></div>
        </div>
    </article>`).join("");
}

export function renderOrders() {
    const user = getCurrentUser();

    return `<main class="standard-page page-width">
        <h1 class="page-title">My Account</h1>
        <div class="account-layout">
            ${accountNavigation("orders")}
            <section class="account-panel">
                <h2>Orders</h2>
                ${!user
                    ? `<div class="empty-state"><p>Please sign in to view orders.</p><a class="primary-button" href="#/login">Sign In</a></div>`
                    : `<div id="orders-list"><p class="page-subtitle">Loading orders...</p></div>`}
            </section>
        </div>
    </main>`;
}

export function mountOrders() {
    if (!getCurrentUser()) return;

    const container = document.querySelector("#orders-list");
    OrderService.list()
        .then(orders => {
            if (container) container.innerHTML = orderCards(orders);
        })
        .catch(error => {
            if (container) container.innerHTML = `<div class="empty-state"><p>${escapeHTML(error.message)}</p></div>`;
        });
}
