import { apiFetch } from "./api.js";

export class ReviewService {
    static async list(productId) {
        return apiFetch(`/api/products/${Number(productId)}/reviews`);
    }

    static async save(productId, payload) {
        return apiFetch(`/api/products/${Number(productId)}/reviews`, { method: "POST", body: payload });
    }
}
