import { Router } from "express";
import {
    createProduct,
    deleteProduct,
    listProducts,
    updateProduct
} from "../controllers/products.controller.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { listReviews, saveReview } from "../controllers/reviews.controller.js";

const router = Router();

router.get("/", listProducts);
router.get("/:id/reviews", listReviews);
router.post("/:id/reviews", requireAuth, saveReview);
router.post("/", requireAdmin, createProduct);
router.put("/:id", requireAdmin, updateProduct);
router.delete("/:id", requireAdmin, deleteProduct);

export default router;
