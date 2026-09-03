import { apiFetch } from "./api.js";
import { getCurrentUser, setAccountData } from "./store.js";

let loadedForUserId = null;

export class AccountService {
    static async load(force = false) {
        const user = getCurrentUser();
        if (!user) {
            loadedForUserId = null;
            setAccountData();
            return { cart: [], wishlist: [] };
        }

        if (!force && loadedForUserId === user.id) return null;
        const data = await apiFetch("/api/account");
        setAccountData(data);
        loadedForUserId = user.id;
        return data;
    }

    static async addCart(item) {
        const data = await apiFetch("/api/account/cart", { method: "POST", body: item });
        setAccountData(data);
        return data;
    }

    static async updateCart(productId, quantity) {
        const data = await apiFetch(`/api/account/cart/${Number(productId)}`, {
            method: "PUT",
            body: { quantity }
        });
        setAccountData(data);
        return data;
    }

    static async removeCart(productId) {
        const data = await apiFetch(`/api/account/cart/${Number(productId)}`, { method: "DELETE" });
        setAccountData(data);
        return data;
    }

    static async toggleWishlist(productId) {
        const data = await apiFetch(`/api/account/wishlist/${Number(productId)}`, { method: "POST" });
        setAccountData(data);
        return data.added;
    }

    static reset() {
        loadedForUserId = null;
        setAccountData();
    }
}
