import "dotenv/config";

export const env = {
    port: Number(process.env.PORT) || 3000,
    mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/eightseconds_final",
    sessionSecret: process.env.SESSION_SECRET || "eight-seconds-class-project",
    adminEmail: (process.env.ADMIN_EMAIL || "admin@8seconds.local").trim().toLowerCase(),
    adminPassword: process.env.ADMIN_PASSWORD || "Admin123!"
};
