import { Router } from "express";
import { createOrder, listMyOrders } from "../controllers/orders.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth);
router.get("/", listMyOrders);
router.post("/", createOrder);

export default router;
