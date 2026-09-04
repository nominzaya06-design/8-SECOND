import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    entry: "./frontend/js/react/admin-stats.js",
    output: {
        path: path.resolve(__dirname, "frontend/webpackOutput"),
        filename: "reactApp.bundle.js",
        clean: true
    }
};
