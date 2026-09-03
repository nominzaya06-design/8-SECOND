import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { cleanText, validEmail } from "../utils/validation.js";

async function orderNumber() {
    const orderCount = await Order.countDocuments();
    return `ORD-${String(orderCount + 1).padStart(4, "0")}`;
}

function cleanShipping(body) {
    return {
        name: cleanText(body?.name, 100),
        email: validEmail(body?.email),
        address: cleanText(body?.address, 180),
        city: cleanText(body?.city, 80),
        phone: cleanText(body?.phone, 40)
    };
}

export async function listMyOrders(req, res, next) {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
        res.json({ orders });
    } catch (error) {
        next(error);
    }
}

export async function createOrder(req, res, next) {
    try {
        const user = await User.findById(req.user._id);
        const rawItems = user?.cart || [];
        if (!rawItems.length) return res.status(400).json({ message: "Your shopping bag is empty." });

        const productIds = rawItems.map(item => item.productId);
        const products = await Product.find({ id: { $in: productIds } });
        if (products.length !== productIds.length) return res.status(400).json({ message: "One product is no longer available." });

        const items = [];
        for (const cartItem of rawItems) {
            const product = products.find(item => item.id === cartItem.productId);
            if (product.stock < cartItem.quantity) {
                return res.status(409).json({ message: `${product.name} does not have enough stock.` });
            }

            items.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                color: cartItem.color,
                quantity: cartItem.quantity
            });
        }

        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = cleanShipping(req.body.shipping);
        if (!shipping.name || !shipping.email || !shipping.address || !shipping.city || !shipping.phone) {
            return res.status(400).json({ message: "Complete all shipping information." });
        }

        const order = new Order({
            orderNumber: await orderNumber(),
            user: req.user._id,
            items,
            shipping,
            total,
            status: "Processing"
        });
        await order.validate();

        await order.save();
        for (const product of products) {
            const cartItem = rawItems.find(item => item.productId === product.id);
            product.stock -= cartItem.quantity;
            await product.save();
        }

        user.cart = [];
        await user.save();

        res.status(201).json({ order: order.toObject() });
    } catch (error) {
        next(error);
    }
}
