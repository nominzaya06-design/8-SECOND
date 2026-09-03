import { renderProductGrid } from "../components/product-card.js";
import { escapeHTML } from "../utils.js";

export function renderSearch(route) {
    const initialQuery = route.query.get("q") || "";

    return `<main class="standard-page page-width search-page">
        <section class="search-hero">
            <p class="eyebrow">8 SECONDS FINDER</p>
            <h1 class="page-title">Search</h1>
            <form class="search-bar" id="search-form">
                <span class="search-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"></circle><path d="m16 16 4 4"></path></svg>
                </span>
                <input id="search-input" type="search" value="${escapeHTML(initialQuery)}" placeholder="Search products" aria-label="Search products">
                <button type="submit">Search</button>
            </form>
            <div class="search-chips" aria-label="Popular categories">
                <a href="#/search?category=Tops">Tops</a>
                <a href="#/search?category=Bottoms">Bottoms</a>
                <a href="#/search?category=Outerwear">Outerwear</a>
                <a href="#/search?category=Dresses">Dresses</a>
                <a href="#/search?category=Accessories">Accessories</a>
            </div>
        </section>
        <p class="result-count search-count" id="search-count"></p>
        <div class="product-grid" id="search-grid"></div>
    </main>`;
}

export function mountSearch(route, products) {
    const form = document.querySelector("#search-form");
    const input = document.querySelector("#search-input");
    const grid = document.querySelector("#search-grid");
    const count = document.querySelector("#search-count");
    const categoryFromUrl = route.query.get("category");

    function update(term = input.value) {
        const normalized = term.trim().toLowerCase();
        const filtered = products.filter(product => {
            const matchesText = !normalized || `${product.name} ${product.category} ${product.gender}`.toLowerCase().includes(normalized);
            const matchesCategory = !categoryFromUrl || product.category === categoryFromUrl;
            return matchesText && matchesCategory;
        });

        count.textContent = normalized
            ? `${filtered.length} products for "${term.trim()}"`
            : `${filtered.length} products`;
        grid.innerHTML = filtered.length
            ? renderProductGrid(filtered)
            : `<div class="empty-state grid-message"><h2>No results</h2><p>Try a different search word.</p></div>`;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        const params = new URLSearchParams();
        const term = input.value.trim();

        if (term) params.set("q", term);
        if (categoryFromUrl) params.set("category", categoryFromUrl);

        const query = params.toString();
        location.hash = query ? `#/search?${query}` : "#/search";
    });

    update(route.query.get("q") || "");
}
