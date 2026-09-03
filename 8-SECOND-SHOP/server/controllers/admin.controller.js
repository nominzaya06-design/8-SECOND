import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { cleanText } from "../utils/validation.js";

const STATUSES = ["Processing", "Shipped", "Delivered", "Cancelled"];

export async function stats(_req, res, next) {
    try {
        const products = await Product.countDocuments();
        const orders = await Order.countDocuments();
        const users = await User.countDocuments();

        res.json({ stats: { products, orders, users } });
    } catch (error) {
        next(error);
    }
}

export async function listOrders(_req, res, next) {
    try {
        const orders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .lean();
        res.json({ orders });
    } catch (error) {
        next(error);
    }
}

export async function updateOrderStatus(req, res, next) {
    try {
        const status = cleanText(req.body.status, 30);
        if (!STATUSES.includes(status)) return res.status(400).json({ message: "Invalid order status." });

        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true }).lean();
        if (!order) return res.status(404).json({ message: "Order not found." });
        res.json({ order });
    } catch (error) {
        next(error);
    }
}

export function saveUploadedImage(req, res) {
    if (!req.file) return res.status(400).json({ message: "Choose a product image." });
    res.status(201).json({ image: `assets/images/${req.file.filename}` });
}
