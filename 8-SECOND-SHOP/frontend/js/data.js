import { apiFetch } from "./api.js";

export class ProductService {
    static products = [];

    static async load(force = false) {
        if (this.products.length && !force) return this.products;

        const data = await apiFetch("/api/products");
        this.products = data.products || [];
        return this.products;
    }

    static async refresh() {
        return this.load(true);
    }

    static find(id) {
        return this.products.find(product => product.id === Number(id));
    }

    static async create(product) {
        const data = await apiFetch("/api/products", { method: "POST", body: product });
        await this.refresh();
        return data.product;
    }

    static async update(id, product) {
        const data = await apiFetch(`/api/products/${Number(id)}`, { method: "PUT", body: product });
        await this.refresh();
        return data.product;
    }

    static async remove(id) {
        await apiFetch(`/api/products/${Number(id)}`, { method: "DELETE" });
        await this.refresh();
    }

}
