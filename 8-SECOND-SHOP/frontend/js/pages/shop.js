import { renderProductGrid } from "../components/product-card.js";
import { formatPrice } from "../utils.js";

const PAGE_SIZE = 10;
const MAX_PRICE = 500000;

function configFor(routeName) {
    const configs = {
        women: {
            title: "Women",
            filter: product => product.gender === "Women" || product.gender === "Unisex"
        },
        men: {
            title: "Men",
            filter: product => product.gender === "Men" || product.gender === "Unisex"
        },
        new: {
            title: "New Arrivals",
            filter: product => product.newArrival
        },
        best: {
            title: "Best Sellers",
            filter: product => product.bestSeller
        },
        sale: {
            title: "Sale",
            filter: product => product.onSale
        }
    };

    return configs[routeName];
}

export function renderShop(route) {
    const config = configFor(route.name);

    return `<main class="shop-page page-width">
        <div class="shop-layout">
            <aside class="shop-sidebar" aria-label="Product filters">
                <h1>${config.title}</h1>

                <section class="filter-group">
                    <h2>Category</h2>
                    <div class="category-filter" id="category-filter">
                        <button class="active" type="button" data-category="all">All Categories</button>
                        <button type="button" data-category="Outerwear">Outerwear</button>
                        <button type="button" data-category="Tops">Tops</button>
                        <button type="button" data-category="Bottoms">Bottoms</button>
                        <button type="button" data-category="Dresses">Dresses</button>
                        <button type="button" data-category="Accessories">Accessories</button>
                    </div>
                </section>

                <section class="filter-group price-filter">
                    <h2>Price Range</h2>
                    <input id="price-filter" type="range" min="0" max="${MAX_PRICE}" step="10000" value="${MAX_PRICE}" aria-label="Maximum price">
                    <div class="price-range-labels">
                        <span>${formatPrice(0)}</span>
                        <span id="price-maximum">${formatPrice(MAX_PRICE)}</span>
                    </div>
                </section>
            </aside>

            <section class="shop-results" aria-live="polite">
                <div class="shop-toolbar">
                    <p id="result-count">0 products</p>
                    <label class="visually-hidden" for="shop-sort">Sort products</label>
                    <select id="shop-sort" class="sort-select">
                        <option value="newest">Newest</option>
                        <option value="name-asc">Name: A to Z</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                    </select>
                </div>

                <div class="product-grid" id="shop-grid"></div>
                <nav class="pagination" id="pagination" aria-label="Product pages"></nav>
            </section>
        </div>
    </main>`;
}

export function mountShop(route, products) {
    const config = configFor(route.name);
    const baseProducts = products.filter(config.filter);

    const categoryFilter = document.querySelector("#category-filter");
    const priceFilter = document.querySelector("#price-filter");
    const priceMaximum = document.querySelector("#price-maximum");
    const sortSelect = document.querySelector("#shop-sort");
    const grid = document.querySelector("#shop-grid");
    const count = document.querySelector("#result-count");
    const pagination = document.querySelector("#pagination");

    let category = "all";
    let page = 1;

    function updateProducts() {
        const maxPrice = Number(priceFilter.value);

        let filtered = baseProducts.filter(product => {
            const categoryMatches = category === "all" || product.category === category;
            const priceMatches = product.price <= maxPrice;
            return categoryMatches && priceMatches;
        });

        if (sortSelect.value === "newest") filtered.sort((a, b) => b.id - a.id);
        if (sortSelect.value === "name-asc") filtered.sort((a, b) => a.name.localeCompare(b.name));
        if (sortSelect.value === "price-asc") filtered.sort((a, b) => a.price - b.price);
        if (sortSelect.value === "price-desc") filtered.sort((a, b) => b.price - a.price);

        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
        page = Math.min(page, totalPages);

        const start = (page - 1) * PAGE_SIZE;
        const visibleProducts = filtered.slice(start, start + PAGE_SIZE);

        count.textContent = `${filtered.length} products`;
        priceMaximum.textContent = formatPrice(maxPrice);
        grid.innerHTML = visibleProducts.length
            ? renderProductGrid(visibleProducts)
            : `<div class="empty-state grid-message"><h2>No products found</h2><p>Try another category or price range.</p></div>`;

        pagination.innerHTML = totalPages > 1
            ? Array.from({ length: totalPages }, (_, index) => {
                const pageNumber = index + 1;
                return `<button class="${pageNumber === page ? "active" : ""}" type="button" data-page="${pageNumber}">${pageNumber}</button>`;
            }).join("")
            : "";
    }

    categoryFilter.addEventListener("click", event => {
        const button = event.target.closest("[data-category]");
        if (!button) return;

        category = button.dataset.category;
        page = 1;
        categoryFilter.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
        updateProducts();
    });

    priceFilter.addEventListener("input", () => {
        page = 1;
        updateProducts();
    });

    sortSelect.addEventListener("change", () => {
        page = 1;
        updateProducts();
    });

    pagination.addEventListener("click", event => {
        const button = event.target.closest("[data-page]");
        if (!button) return;

        page = Number(button.dataset.page);
        updateProducts();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    updateProducts();
}
