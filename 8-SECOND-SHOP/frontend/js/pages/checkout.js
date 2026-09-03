import { ProductService } from "../data.js";
import { AccountService } from "../account-service.js";
import { OrderService } from "../order-service.js";
import { getCart, getCurrentUser } from "../store.js";
import { escapeHTML, formatPrice, showToast } from "../utils.js";

function cartRows(products) {
    return getCart().map(item => ({
        ...item,
        product: products.find(product => product.id === item.productId)
    })).filter(item => item.product);
}

function orderSummary(rows) {
    const total = rows.reduce((sum, row) => sum + row.product.price * row.quantity, 0);
    return `<aside class="summary-card checkout-summary">
        <h2>Your Order</h2>
        ${rows.map(row => `<div class="review-item"><img src="${escapeHTML(row.product.image)}" alt=""><span>${escapeHTML(row.product.name)} × ${row.quantity} <span class="cart-color-swatch" style="--swatch:${escapeHTML(row.color)}" aria-label="Selected color"></span></span><strong>${formatPrice(row.product.price * row.quantity)}</strong></div>`).join("")}
        <div class="summary-row total"><span>Total</span><strong>${formatPrice(total)}</strong></div>
    </aside>`;
}

export function renderCheckout(products) {
    const user = getCurrentUser();
    if (!user) {
        return `<main class="standard-page page-width"><div class="empty-state account-empty"><h1>Sign in to checkout</h1><p>Your shopping bag is connected to your account.</p><div class="inline-actions center-actions"><a class="primary-button" href="#/login">Sign In</a><a class="secondary-button" href="#/register">Create Account</a></div></div></main>`;
    }

    const rows = cartRows(products);
    if (!rows.length) {
        return `<main class="standard-page page-width"><div class="empty-state"><h1>Nothing to checkout</h1><a class="primary-button" href="#/cart">Back to Bag</a></div></main>`;
    }

    return `<main class="standard-page page-width checkout-shell">
        <h1 class="page-title">Checkout</h1>
        <div class="checkout-steps">
            <span class="checkout-step active" data-step-label="1" data-short="1. Info">1. Information</span>
            <span class="checkout-step" data-step-label="2" data-short="2. Pay">2. Payment</span>
            <span class="checkout-step" data-step-label="3" data-short="3. Confirm">3. Confirmation</span>
        </div>

        <div class="checkout-layout">
            <section class="checkout-panel">
                <form id="checkout-form" novalidate>
                    <div data-checkout-step="1">
                        <h2>Shipping Information</h2>
                        <div class="form-grid">
                            <div class="field"><label for="checkout-name">Full Name</label><input id="checkout-name" name="name" value="${escapeHTML(user.name)}" required></div>
                            <div class="field"><label for="checkout-email">Email</label><input id="checkout-email" name="email" type="email" value="${escapeHTML(user.email)}" required></div>
                            <div class="field full"><label for="checkout-address">Address</label><input id="checkout-address" name="address" required></div>
                            <div class="field"><label for="checkout-city">City</label><input id="checkout-city" name="city" required></div>
                            <div class="field"><label for="checkout-phone">Phone</label><input id="checkout-phone" name="phone" required></div>
                        </div>
                    </div>

                    <div data-checkout-step="2" hidden>
                        <h2>Payment</h2>
                        <div class="form-grid">
                            <div class="field full"><label for="card-name">Name on Card</label><input id="card-name" name="cardName" required></div>
                            <div class="field full"><label for="card-number">Card Number</label><input id="card-number" name="cardNumber" inputmode="numeric" pattern="[0-9 ]{12,19}" placeholder="0000 0000 0000 0000" required></div>
                            <div class="field"><label for="card-expiry">Expiry</label><input id="card-expiry" name="expiry" placeholder="MM/YY" required></div>
                            <div class="field"><label for="card-cvc">CVC</label><input id="card-cvc" name="cvc" inputmode="numeric" pattern="[0-9]{3,4}" required></div>
                        </div>
                        <p class="form-note">Demo payment only — card fields are validated in the browser and are not stored or sent to the server.</p>
                    </div>

                    <div data-checkout-step="3" hidden>
                        <h2>Confirm Order?</h2>
                        <div class="confirm-order-actions">
                            <button class="primary-button" id="checkout-confirm-yes" type="submit">Yes</button>
                            <button class="secondary-button" id="checkout-confirm-no" type="button">No</button>
                        </div>
                    </div>

                    <div class="checkout-actions">
                        <button class="secondary-button" id="checkout-back" type="button" hidden>Back</button>
                        <button class="primary-button" id="checkout-next" type="button">Continue</button>
                    </div>
                </form>
            </section>

            ${orderSummary(rows)}
        </div>
    </main>`;
}

export function mountCheckout(products) {
    const rows = cartRows(products);
    const form = document.querySelector("#checkout-form");
    if (!rows.length || !form) return;

    const backButton = document.querySelector("#checkout-back");
    const nextButton = document.querySelector("#checkout-next");
    const submitButton = document.querySelector("#checkout-confirm-yes");
    const noButton = document.querySelector("#checkout-confirm-no");
    let step = 1;

    function showStep() {
        document.querySelectorAll("[data-checkout-step]").forEach(section => {
            section.hidden = Number(section.dataset.checkoutStep) !== step;
        });

        document.querySelectorAll("[data-step-label]").forEach(label => {
            const number = Number(label.dataset.stepLabel);
            label.classList.toggle("active", number === step);
            label.classList.toggle("done", number < step);
        });

        backButton.hidden = step === 1 || step === 3;
        nextButton.hidden = step === 3;
    }

    function stepIsValid(stepNumber) {
        const section = document.querySelector(`[data-checkout-step="${stepNumber}"]`);
        const invalidInput = [...section.querySelectorAll("input")].find(input => !input.checkValidity());
        if (!invalidInput) return true;

        step = stepNumber;
        showStep();
        requestAnimationFrame(() => invalidInput.reportValidity());
        return false;
    }

    nextButton.addEventListener("click", () => {
        if (!stepIsValid(step)) return;
        step += 1;
        showStep();
    });

    backButton.addEventListener("click", () => {
        step -= 1;
        showStep();
    });

    noButton.addEventListener("click", () => {
        step = 2;
        showStep();
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!stepIsValid(1) || !stepIsValid(2)) return;

        const data = new FormData(form);
        const shipping = {
            name: String(data.get("name") || "").trim(),
            email: String(data.get("email") || "").trim(),
            address: String(data.get("address") || "").trim(),
            city: String(data.get("city") || "").trim(),
            phone: String(data.get("phone") || "").trim()
        };

        submitButton.disabled = true;

        try {
            await OrderService.create({ shipping });
            await AccountService.load(true);
            await ProductService.refresh();
            showToast("Order placed successfully.");
            location.hash = "#/orders";
        } catch (error) {
            showToast(error.message);
            if (error.status === 401) location.hash = "#/login";
        } finally {
            submitButton.disabled = false;
        }
    });

    showStep();
}
