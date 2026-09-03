import { calculateDiscount, escapeHTML, formatPrice } from "../utils.js";
import { isWishlisted } from "../store.js";

class ProductCard {
    constructor(product) {
        this.product = product;
    }

    render() {
        const product = this.product;
        const discount = calculateDiscount(product.price, product.oldPrice);
        const wished = isWishlisted(product.id);
        const swatches = product.colors
            .map(color => `<span style="--swatch: ${escapeHTML(color)}"></span>`)
            .join("");

        return `<article class="product-card">
            <figure>
                <a href="#/product/${product.id}" aria-label="View ${escapeHTML(product.name)}">
                    <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy">
                </a>
                ${discount ? `<span class="discount">-${discount}%</span>` : ""}
                <button class="heart ${wished ? "active" : ""}" type="button"
                    data-wishlist="${product.id}"
                    aria-label="${wished ? "Remove from" : "Add to"} wishlist"
                    aria-pressed="${wished}">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 5.9l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.3a5.5 5.5 0 0 0 0-7.8Z"></path>
                    </svg>
                </button>
            </figure>
            <div class="swatches" aria-label="Available colors">${swatches}</div>
            <h3><a href="#/product/${product.id}">${escapeHTML(product.name)}</a></h3>
            <p class="price">
                <strong>${formatPrice(product.price)}</strong>
                ${discount ? `<del>${formatPrice(product.oldPrice)}</del>` : ""}
            </p>
        </article>`;
    }
}

export function renderProductGrid(products) {
    return products.map(product => new ProductCard(product).render()).join("");
}
