import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { cleanText, positiveInteger } from "../utils/validation.js";

export async function listReviews(req, res, next) {
    try {
        const productId = Number(req.params.id);
        const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean();
        const averageRating = reviews.length
            ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
            : null;

        res.json({ reviews, averageRating, count: reviews.length });
    } catch (error) {
        next(error);
    }
}

export async function saveReview(req, res, next) {
    try {
        const productId = Number(req.params.id);
        const productExists = await Product.exists({ id: productId });
        if (!productExists) return res.status(404).json({ message: "Product not found." });

        const rating = Math.min(5, Math.max(1, positiveInteger(req.body.rating, 0)));
        const comment = cleanText(req.body.comment, 600);
        if (!rating || comment.length < 2) return res.status(400).json({ message: "Add a rating and comment." });

        const review = await Review.findOneAndUpdate(
            { productId, user: req.user._id },
            { productId, user: req.user._id, userName: req.user.name, rating, comment },
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        ).lean();

        const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean();
        const averageRating = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;

        res.json({ review, reviews, averageRating, count: reviews.length });
    } catch (error) {
        next(error);
    }
}
