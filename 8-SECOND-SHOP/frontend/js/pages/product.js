import { renderProductGrid } from "../components/product-card.js";
import { AccountService } from "../account-service.js";
import { getCurrentUser, isWishlisted } from "../store.js";
import { escapeHTML, formatDate, formatPrice, showToast } from "../utils.js";
import { ReviewService } from "../review-service.js";

function reviewSection(product) {
    const user = getCurrentUser();

    return `<section class="reviews-section" aria-labelledby="reviews-title">
        <header class="section-heading review-heading">
            <div>
                <h2 id="reviews-title">Customer Reviews</h2>
                <p class="page-subtitle" id="review-summary">Loading reviews...</p>
            </div>
        </header>

        ${user ? `<form id="review-form" class="review-form">
            <div class="field">
                <label for="review-rating">Rating</label>
                <select id="review-rating" name="rating" required>
                    <option value="5">5 — Excellent</option>
                    <option value="4">4 — Good</option>
                    <option value="3">3 — Okay</option>
                    <option value="2">2 — Poor</option>
                    <option value="1">1 — Very poor</option>
                </select>
            </div>
            <div class="field review-comment-field">
                <label for="review-comment">Comment</label>
                <textarea id="review-comment" name="comment" minlength="2" maxlength="600" placeholder="Share your experience" required></textarea>
            </div>
            <button class="primary-button" type="submit">Save Review</button>
        </form>` : `<p class="review-signin"><a class="text-link" href="#/login">Sign in</a> to leave a rating and comment.</p>`}

        <div class="review-list" id="review-list"><p class="page-subtitle">Loading...</p></div>
    </section>`;
}

function renderReviewData(data) {
    const summary = document.querySelector("#review-summary");
    const list = document.querySelector("#review-list");
    if (!summary || !list) return;

    summary.textContent = data.count
        ? `${Number(data.averageRating).toFixed(1)} / 5 from ${data.count} review${data.count === 1 ? "" : "s"}`
        : "No customer reviews yet.";

    list.innerHTML = data.reviews.length
        ? data.reviews.map(review => `<article class="review-card">
            <header><strong>${escapeHTML(review.userName)}</strong><span>${review.rating} / 5</span></header>
            <p>${escapeHTML(review.comment)}</p>
            <small>${escapeHTML(formatDate(review.createdAt))}</small>
        </article>`).join("")
        : `<div class="empty-state compact-empty"><p>Be the first to review this product.</p></div>`;
}

async function mountReviews(product) {
    try {
        renderReviewData(await ReviewService.list(product.id));
    } catch (error) {
        const list = document.querySelector("#review-list");
        if (list) list.innerHTML = `<div class="empty-state compact-empty"><p>${escapeHTML(error.message)}</p></div>`;
    }

    const form = document.querySelector("#review-form");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const button = form.querySelector("button[type='submit']");
        const data = new FormData(form);
        button.disabled = true;

        try {
            const result = await ReviewService.save(product.id, {
                rating: Number(data.get("rating")),
                comment: String(data.get("comment") || "").trim()
            });
            renderReviewData(result);
            form.reset();
            showToast("Review saved.");
        } catch (error) {
            showToast(error.message);
            if (error.status === 401) location.hash = "#/login";
        } finally {
            button.disabled = false;
        }
    });
}

export function renderProduct(product, products) {
    if (!product) {
        return `<main class="standard-page page-width"><div class="empty-state"><h1>Product not found</h1><a class="text-link" href="#/home">Return home</a></div></main>`;
    }

    const related = products
        .filter(item =>
            item.id !== product.id &&
            item.category === product.category &&
            (item.gender === product.gender || item.gender === "Unisex")
        )
        .slice(0, 5);

    const colors = product.colors
        .map((color, index) => `<button class="color-button ${index === 0 ? "active" : ""}" type="button" data-color="${escapeHTML(color)}" style="--option-color:${escapeHTML(color)}" aria-label="Color ${index + 1}"></button>`)
        .join("");

    const wished = isWishlisted(product.id);
    const outOfStock = product.stock === 0;
    const showOldPrice = product.oldPrice && product.oldPrice > product.price;

    return `<main class="standard-page page-width">
        <button class="product-back-button" id="product-back" type="button">← Back</button>
        <section class="product-detail">
            <div class="product-detail-image">
                <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
            </div>

            <div class="product-info">
                <p class="brand">8 SECONDS</p>
                <h1>${escapeHTML(product.name)}</h1>
                <p class="product-price"><strong>${formatPrice(product.price)}</strong>${showOldPrice ? ` <del>${formatPrice(product.oldPrice)}</del>` : ""}</p>
                <p class="product-description">${escapeHTML(product.description)}</p>

                <div class="product-colors">
                    <strong>Color</strong>
                    <div class="color-options" id="color-options">${colors}</div>
                </div>

                <div class="product-quantity">
                    <strong>Quantity</strong>
                    <div class="quantity-control">
                        <button type="button" id="quantity-minus" aria-label="Decrease quantity" ${outOfStock ? "disabled" : ""}>−</button>
                        <span id="quantity-value">${outOfStock ? 0 : 1}</span>
                        <button type="button" id="quantity-plus" aria-label="Increase quantity" ${outOfStock ? "disabled" : ""}>+</button>
                    </div>
                </div>

                <div class="product-cta">
                    <button class="primary-button" id="add-to-cart" type="button" ${outOfStock ? "disabled" : ""}>${outOfStock ? "Out of Stock" : "Add to Bag"}</button>
                    <button class="secondary-button detail-wishlist ${wished ? "active" : ""}" id="detail-wishlist" type="button" aria-pressed="${wished}">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 5.9l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.3a5.5 5.5 0 0 0 0-7.8Z"></path></svg>
                        <span>${wished ? "Saved" : "Wishlist"}</span>
                    </button>
                </div>

                <div class="product-meta">
                    <span>Stock: ${product.stock}</span>
                    <span>Category: ${escapeHTML(product.category)}</span>
                </div>
            </div>
        </section>

        ${reviewSection(product)}

        ${related.length ? `<section class="recommendations"><header class="section-heading"><h2>You May Also Like</h2></header><div class="product-grid">${renderProductGrid(related)}</div></section>` : ""}
    </main>`;
}

export function mountProduct(product) {
    if (!product) return;

    let selectedColor = product.colors[0];
    let quantity = product.stock > 0 ? 1 : 0;
    const quantityValue = document.querySelector("#quantity-value");

    document.querySelector("#product-back")?.addEventListener("click", () => {
        if (history.length > 1) history.back();
        else location.hash = "#/home";
    });

    document.querySelector("#color-options")?.addEventListener("click", event => {
        const button = event.target.closest("[data-color]");
        if (!button) return;

        selectedColor = button.dataset.color;
        document.querySelectorAll("[data-color]").forEach(item => {
            item.classList.toggle("active", item === button);
        });
    });

    document.querySelector("#quantity-minus")?.addEventListener("click", () => {
        if (product.stock === 0) return;
        quantity = Math.max(1, quantity - 1);
        quantityValue.textContent = quantity;
    });

    document.querySelector("#quantity-plus")?.addEventListener("click", () => {
        if (product.stock === 0) return;
        quantity = Math.min(product.stock, quantity + 1);
        quantityValue.textContent = quantity;
    });

    document.querySelector("#add-to-cart")?.addEventListener("click", async () => {
        if (product.stock === 0) return;
        if (!getCurrentUser()) {
            showToast("Please sign in to use your shopping bag.");
            location.hash = "#/login";
            return;
        }

        try {
            await AccountService.addCart({ productId: product.id, color: selectedColor, quantity });
            showToast("Added to shopping bag.");
        } catch (error) {
            showToast(error.message);
        }
    });

    document.querySelector("#detail-wishlist")?.addEventListener("click", async event => {
        if (!getCurrentUser()) {
            showToast("Please sign in to use your wishlist.");
            location.hash = "#/login";
            return;
        }

        const button = event.currentTarget;
        if (button.dataset.pending === "true") return;

        const label = button.querySelector("span");
        const wasAdded = button.classList.contains("active");

        function updateButton(added) {
            button.classList.toggle("active", added);
            button.setAttribute("aria-pressed", String(added));
            label.textContent = added ? "Saved" : "Wishlist";
        }

        button.dataset.pending = "true";
        updateButton(!wasAdded);

        try {
            const added = await AccountService.toggleWishlist(product.id);
            updateButton(added);
            showToast(added ? "Saved to wishlist." : "Removed from wishlist.");
        } catch (error) {
            updateButton(wasAdded);
            showToast(error.message);
        } finally {
            delete button.dataset.pending;
        }
    });

    mountReviews(product);
}
