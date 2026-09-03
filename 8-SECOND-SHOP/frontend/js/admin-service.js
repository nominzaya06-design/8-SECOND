import { apiFetch } from "./api.js";

export class AdminService {
    static async uploadImage(file) {
        const form = new FormData();
        form.append("image", file);
        const data = await apiFetch("/api/admin/upload", { method: "POST", body: form });
        return data.image;
    }

    static async orders() {
        const data = await apiFetch("/api/admin/orders");
        return data.orders || [];
    }

    static async updateOrderStatus(orderId, status) {
        const data = await apiFetch(`/api/admin/orders/${orderId}/status`, {
            method: "PATCH",
            body: { status }
        });
        return data.order;
    }
}
