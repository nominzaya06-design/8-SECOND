import { Router } from "express";
import {
    addCartItem,
    getAccount,
    removeCartItem,
    toggleWishlist,
    updateCartItem
} from "../controllers/account.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", getAccount);
router.post("/cart", addCartItem);
router.put("/cart/:productId", updateCartItem);
router.delete("/cart/:productId", removeCartItem);
router.post("/wishlist/:productId", toggleWishlist);

export default router;
