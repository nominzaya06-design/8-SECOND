import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true, trim: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true, minlength: 2, maxlength: 600 }
}, { timestamps: true, versionKey: false });

reviewSchema.index({ productId: 1, user: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
