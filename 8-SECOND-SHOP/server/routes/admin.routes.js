import { Router } from "express";
import { listOrders, saveUploadedImage, stats, updateOrderStatus } from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/auth.js";
import { uploadProductImage } from "../middleware/upload.js";

const router = Router();

router.use(requireAdmin);
router.get("/stats", stats);
router.get("/orders", listOrders);
router.post("/upload", uploadProductImage.single("image"), saveUploadedImage);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
