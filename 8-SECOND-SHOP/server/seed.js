import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { Product } from "./models/Product.js";
import { Order } from "./models/Order.js";
import { User } from "./models/User.js";
import { hashPassword } from "./utils/password.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.resolve(__dirname, "../frontend/data/products.json");

export async function seedIfEmpty() {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
        const products = JSON.parse(await fs.readFile(seedPath, "utf8"));
        await Product.insertMany(products);
        console.log(`Seeded ${products.length} products.`);
    }

    await User.updateMany(
        {
            $or: [
                { "cart.key": { $exists: true } },
                { cart: { $elemMatch: { color: { $exists: false } } } }
            ]
        },
        { $set: { cart: [] } }
    );

    const orders = await Order.find().sort({ createdAt: 1 });
    for (let index = 0; index < orders.length; index += 1) {
        const number = `ORD-${String(index + 1).padStart(4, "0")}`;
        if (orders[index].orderNumber !== number) {
            orders[index].orderNumber = number;
            await orders[index].save();
        }
    }

    const existingAdmin = await User.findOne({ email: env.adminEmail });
    if (!existingAdmin) {
        await User.create({
            name: "8 Seconds Admin",
            email: env.adminEmail,
            passwordHash: await hashPassword(env.adminPassword),
            role: "admin"
        });
        console.log(`Created admin account: ${env.adminEmail}`);
    }
}

async function run() {
    await connectDatabase();
    await seedIfEmpty();
    await mongoose.disconnect();
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    run().catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
}
