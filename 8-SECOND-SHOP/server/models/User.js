import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    productId: { type: Number, required: true },
    color: { type: String, required: true, trim: true, maxlength: 80 },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180 },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    cart: { type: [cartItemSchema], default: [] },
    wishlist: { type: [Number], default: [] }
});

export const User = mongoose.model("User", userSchema);
