import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { seedIfEmpty } from "./seed.js";

async function start() {
    await connectDatabase();
    await seedIfEmpty();

    app.listen(env.port, "0.0.0.0", () => {
        console.log(`8 Seconds: http://localhost:${env.port}`);
    });
}

start().catch(error => {
    console.error("Could not start the server.", error);
    process.exitCode = 1;
});
