import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { cleanText, positiveInteger } from "../utils/validation.js";

function accountData(user) {
    return {
        cart: user?.cart || [],
        wishlist: user?.wishlist || []
    };
}

export async function getAccount(req, res, next) {
    try {
        const user = await User.findById(req.user._id).select("cart wishlist").lean();
        res.json(accountData(user));
    } catch (error) {
        next(error);
    }
}

export async function addCartItem(req, res, next) {
    try {
        const productId = Number(req.body.productId);
        const color = cleanText(req.body.color, 80);
        const quantity = Math.max(1, positiveInteger(req.body.quantity, 1));
        const product = await Product.findOne({ id: productId }).lean();

        if (!product) return res.status(404).json({ message: "Product not found." });
        if (!product.colors.includes(color)) return res.status(400).json({ message: "Choose a valid color." });
        if (product.stock < 1) return res.status(409).json({ message: "This product is out of stock." });

        const user = await User.findById(req.user._id);
        const existing = user.cart.find(item => item.productId === productId);
        const newQuantity = existing?.color === color
            ? existing.quantity + quantity
            : quantity;
        if (newQuantity > product.stock) {
            return res.status(409).json({ message: "Not enough stock available." });
        }

        if (existing) {
            existing.color = color;
            existing.quantity = newQuantity;
        } else {
            user.cart.push({ productId, color, quantity });
        }

        await user.save();
        res.json(accountData(user));
    } catch (error) {
        next(error);
    }
}

export async function updateCartItem(req, res, next) {
    try {
        const user = await User.findById(req.user._id);
        const productId = Number(req.params.productId);
        const item = user.cart.find(row => row.productId === productId);
        if (!item) return res.status(404).json({ message: "Cart item not found." });

        const product = await Product.findOne({ id: productId }).lean();
        if (!product) return res.status(404).json({ message: "Product not found." });

        const quantity = Math.max(1, positiveInteger(req.body.quantity, 1));
        if (quantity > product.stock) return res.status(409).json({ message: "Not enough stock available." });
        item.quantity = quantity;

        await user.save();
        res.json(accountData(user));
    } catch (error) {
        next(error);
    }
}

export async function removeCartItem(req, res, next) {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { cart: { productId: Number(req.params.productId) } } },
            { new: true, runValidators: true }
        );
        res.json(accountData(user));
    } catch (error) {
        next(error);
    }
}

export async function toggleWishlist(req, res, next) {
    try {
        const productId = Number(req.params.productId);
        if (!Number.isFinite(productId) || !(await Product.exists({ id: productId }))) {
            return res.status(404).json({ message: "Product not found." });
        }

        const user = await User.findById(req.user._id);
        const saved = user.wishlist.includes(productId);
        user.wishlist = saved
            ? user.wishlist.filter(id => id !== productId)
            : [...user.wishlist, productId];
        await user.save();

        res.json({ ...accountData(user), added: !saved });
    } catch (error) {
        next(error);
    }
}
