import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const productImagesDir = path.resolve(__dirname, "../../frontend/assets/images");

const extensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp"
};

const storage = multer.diskStorage({
    destination: productImagesDir,
    filename: (_req, file, callback) => {
        callback(null, `product-${Date.now()}${extensions[file.mimetype]}`);
    }
});

export const uploadProductImage = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        if (!extensions[file.mimetype]) {
            const error = new Error("Choose a JPG, PNG, or WebP image.");
            error.status = 400;
            return callback(error);
        }
        callback(null, true);
    }
});
