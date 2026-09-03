import { renderProductGrid } from "../components/product-card.js";

const HERO_IMAGES = [
    "assets/images/hero-1.png",
    "assets/images/hero-2.png",
    "assets/images/hero-3.png",
    "assets/images/hero-4.png",
    "assets/images/hero-5.png",
    "assets/images/hero-6.png"
];

export function renderHome(products) {
    const saleProducts = products.filter(product => product.onSale).slice(0, 5);
    const saleIds = new Set(saleProducts.map(product => product.id));

    const bestProducts = products
        .filter(product => product.bestSeller && !saleIds.has(product.id))
        .slice(0, 5);
    const bestIds = new Set(bestProducts.map(product => product.id));

    const newProducts = products
        .filter(product => product.newArrival && !saleIds.has(product.id) && !bestIds.has(product.id))
        .slice(0, 5);

    const heroSlides = HERO_IMAGES.map((image, index) => `
        <img class="hero-slide ${index === 0 ? "active" : ""}"
            src="${image}"
            alt="Spring summer fashion campaign ${index + 1}"
            data-hero-slide>`).join("");

    const heroDots = HERO_IMAGES.map((_, index) => `
        <button class="hero-dot ${index === 0 ? "active" : ""}"
            type="button"
            data-hero-dot="${index}"
            aria-label="Show banner ${index + 1}"
            aria-pressed="${index === 0}"></button>`).join("");

    return `<main>
        <section class="hero" aria-label="Season campaign">
            <div class="hero-slides">${heroSlides}</div>
            <button class="hero-arrow hero-arrow-prev" type="button" data-hero-prev aria-label="Previous banner">‹</button>
            <button class="hero-arrow hero-arrow-next" type="button" data-hero-next aria-label="Next banner">›</button>

            <div class="hero-content page-width">
                <p class="eyebrow">SPRING / SUMMER 2026</p>
                <h1>8 seconds</h1>
                <p class="hero-description">Enjoy easy and comfortable style<br>for your everyday life.</p>
                <a class="primary-button hero-button" href="#/new-arrivals">SHOP NOW</a>
            </div>

            <div class="hero-dots" aria-label="Banner navigation">${heroDots}</div>
        </section>

        <section class="categories page-width" aria-label="Shop categories">
            <a href="#/women">
                <img src="assets/images/woman.png" alt="Women's collection">
                <span>Women</span>
            </a>
            <a href="#/men">
                <img src="assets/images/men.png" alt="Men's collection">
                <span>Men</span>
            </a>
            <a href="#/new-arrivals">
                <img src="assets/images/newcol.png" alt="New arrivals">
                <span>New Arrivals</span>
            </a>
            <a href="#/search?category=Accessories">
                <img src="assets/images/bag.png" alt="Accessories collection">
                <span>Accessories</span>
            </a>
        </section>

        <section class="product-section soft-section">
            <div class="page-width">
                <header class="section-heading">
                    <h2>On Sale</h2>
                    <a href="#/sale">View all →</a>
                </header>
                <div class="product-grid">${renderProductGrid(saleProducts)}</div>
            </div>
        </section>

        <section class="product-section page-width">
            <header class="section-heading">
                <h2>Best Sellers</h2>
                <a href="#/best">View all →</a>
            </header>
            <div class="product-grid">${renderProductGrid(bestProducts)}</div>
        </section>

        <section class="product-section soft-section">
            <div class="page-width">
                <header class="section-heading">
                    <h2>New Arrivals</h2>
                    <a href="#/new-arrivals">View all →</a>
                </header>
                <div class="product-grid">${renderProductGrid(newProducts)}</div>
            </div>
        </section>
    </main>`;
}

function mountHeroSlider() {
    const hero = document.querySelector(".hero");
    if (!hero) return;

    const slides = [...hero.querySelectorAll("[data-hero-slide]")];
    const dots = [...hero.querySelectorAll("[data-hero-dot]")];
    const previousButton = hero.querySelector("[data-hero-prev]");
    const nextButton = hero.querySelector("[data-hero-next]");
    if (slides.length < 2) return;

    let current = 0;

    function showSlide(index) {
        current = index;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            const active = dotIndex === current;
            dot.classList.toggle("active", active);
            dot.setAttribute("aria-pressed", String(active));
        });
    }

    function nextSlide() {
        showSlide((current + 1) % slides.length);
    }

    function previousSlide() {
        showSlide((current - 1 + slides.length) % slides.length);
    }

    function startTimer() {
        return setInterval(() => {
            if (!document.body.contains(hero)) {
                clearInterval(timer);
                return;
            }
            nextSlide();
        }, 5000);
    }

    function restartTimer() {
        clearInterval(timer);
        timer = startTimer();
    }

    let timer = startTimer();

    previousButton.addEventListener("click", () => {
        previousSlide();
        restartTimer();
    });

    nextButton.addEventListener("click", () => {
        nextSlide();
        restartTimer();
    });

    dots.forEach(dot => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.heroDot));
            restartTimer();
        });
    });
}

export function mountHome() {
    mountHeroSlider();
}
