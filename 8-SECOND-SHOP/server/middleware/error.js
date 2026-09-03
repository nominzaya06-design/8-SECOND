export function notFound(req, res, next) {
    if (req.path.startsWith("/api/")) return res.status(404).json({ message: "API route not found." });
    next();
}

export function errorHandler(error, _req, res, _next) {
    console.error(error);

    if (error?.name === "MulterError") {
        return res.status(400).json({ message: error.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller." : "Image upload failed." });
    }

    if (error?.status === 400) {
        return res.status(400).json({ message: error.message });
    }

    if (error?.code === 11000) {
        return res.status(409).json({ message: "That value already exists." });
    }

    if (error?.name === "ValidationError") {
        const firstMessage = Object.values(error.errors || {})[0]?.message;
        return res.status(400).json({ message: firstMessage || "Invalid request data." });
    }

    if (error?.name === "CastError") {
        return res.status(400).json({ message: `Invalid ${error.path || "request"}.` });
    }

    res.status(error?.status || 500).json({ message: error?.status ? error.message : "Server error." });
}
