import { getCartCount } from "../store.js";

class CartBadge extends HTMLElement {
    connectedCallback() {
        this.update();
        this.handleStateChange = () => this.update();
        document.addEventListener("shop:statechange", this.handleStateChange);
    }

    disconnectedCallback() {
        document.removeEventListener("shop:statechange", this.handleStateChange);
    }

    update() {
        const count = getCartCount();
        this.textContent = count;
        this.hidden = count === 0;
    }
}

if (!customElements.get("cart-badge")) {
    customElements.define("cart-badge", CartBadge);
}
