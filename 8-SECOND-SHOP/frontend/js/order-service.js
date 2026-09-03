import { apiFetch } from "./api.js";

export class OrderService {
    static async list() {
        const data = await apiFetch("/api/orders");
        return data.orders || [];
    }

    static async create(payload) {
        const data = await apiFetch("/api/orders", { method: "POST", body: payload });
        return data.order;
    }
}
