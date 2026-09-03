import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 800 },
    gender: { type: String, enum: ["Women", "Men", "Unisex"], required: true },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null, min: 0 },
    image: { type: String, required: true, trim: true, maxlength: 300 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    colors: [{ type: String, trim: true, maxlength: 80 }],
    newArrival: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false }
}, { versionKey: false });

export const Product = mongoose.model("Product", productSchema);
