import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { env } from "./config/env.js";
import { attachUser } from "./middleware/auth.js";
import { errorHandler, notFound } from "./middleware/error.js";
import authRoutes from "./routes/auth.routes.js";
import accountRoutes from "./routes/account.routes.js";
import productsRoutes from "./routes/products.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const frontendDir = path.join(root, "frontend");

export const app = express();

app.use(express.json());
app.use(session({
    name: "eight.sid",
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: env.mongoUri }),
    cookie: { httpOnly: true, sameSite: "lax" }
}));
app.use(attachUser);

app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);

app.get("/vendor/react.production.min.js", (_req, res) => {
    res.sendFile(path.join(root, "node_modules/react/umd/react.production.min.js"));
});

app.get("/vendor/react-dom.production.min.js", (_req, res) => {
    res.sendFile(path.join(root, "node_modules/react-dom/umd/react-dom.production.min.js"));
});

app.use(express.static(frontendDir));

app.use((req, res, next) => {
    if (req.path.startsWith("/api/")) return next();
    res.sendFile(path.join(frontendDir, "index.html"));
});

app.use(notFound);
app.use(errorHandler);
