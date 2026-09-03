import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { User } from "../models/User.js";
import { cleanText, positiveInteger, positiveNumber, stringArray } from "../utils/validation.js";

function parseBoolean(value, fallback = false) {
    if (value === true || value === "true" || value === 1 || value === "1") return true;
    if (value === false || value === "false" || value === 0 || value === "0") return false;
    return fallback;
}

function productPayload(body, existing = null) {
    const price = positiveNumber(body.price, existing?.price ?? 0);
    const onSale = parseBoolean(body.onSale, existing?.onSale ?? false);
    const candidateOldPrice = body.oldPrice === null || body.oldPrice === ""
        ? null
        : positiveNumber(body.oldPrice, 0);

    return {
        name: cleanText(body.name, 120),
        description: cleanText(body.description, 800),
        gender: ["Women", "Men", "Unisex"].includes(body.gender) ? body.gender : "Unisex",
        category: cleanText(body.category, 80),
        price,
        oldPrice: onSale && candidateOldPrice > price ? candidateOldPrice : null,
        image: cleanText(body.image, 300),
        stock: positiveInteger(body.stock, existing?.stock ?? 0),
        colors: stringArray(body.colors, existing?.colors ?? ["hsl(0 0% 15%)"]),
        newArrival: parseBoolean(body.newArrival, existing?.newArrival ?? false),
        bestSeller: parseBoolean(body.bestSeller, existing?.bestSeller ?? false),
        onSale
    };
}

function validateProduct(product) {
    if (!product.name || !product.description || !product.category || !product.image) return "Complete all required product fields.";
    if (product.price <= 0) return "Price must be greater than zero.";
    if (product.onSale && (!product.oldPrice || product.oldPrice <= product.price)) return "Sale old price must be higher than the current price.";
    return "";
}

export async function listProducts(req, res, next) {
    try {
        const products = await Product.find().sort({ id: 1 }).lean();
        res.json({ products });
    } catch (error) {
        next(error);
    }
}

export async function createProduct(req, res, next) {
    try {
        const last = await Product.findOne().sort({ id: -1 }).select("id").lean();
        const product = productPayload(req.body);
        const validationError = validateProduct(product);
        if (validationError) return res.status(400).json({ message: validationError });

        const created = await Product.create({ id: (last?.id || 0) + 1, ...product });
        res.status(201).json({ product: created.toObject() });
    } catch (error) {
        next(error);
    }
}

export async function updateProduct(req, res, next) {
    try {
        const id = Number(req.params.id);
        const existing = await Product.findOne({ id });
        if (!existing) return res.status(404).json({ message: "Product not found." });

        const product = productPayload(req.body, existing.toObject());
        const validationError = validateProduct(product);
        if (validationError) return res.status(400).json({ message: validationError });

        Object.assign(existing, product);
        await existing.save();
        res.json({ product: existing.toObject() });
    } catch (error) {
        next(error);
    }
}

export async function deleteProduct(req, res, next) {
    try {
        const id = Number(req.params.id);
        const deleted = await Product.findOneAndDelete({ id });
        if (!deleted) return res.status(404).json({ message: "Product not found." });
        await Promise.all([
            Review.deleteMany({ productId: id }),
            User.updateMany({}, { $pull: { cart: { productId: id }, wishlist: id } })
        ]);
        res.json({ ok: true });
    } catch (error) {
        next(error);
    }
}
