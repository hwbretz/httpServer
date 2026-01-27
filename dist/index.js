import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses } from "./api/nonOKmiddleware.js";
import { handlerReqCount, middlewareMetricsInc } from "./api/reqCountmiddleware.js";
import { errorHandler } from "./api/errorHandler.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import { handlerCreateUser } from "./api/createUserHandler.js";
import { reset } from "./api/reset.js";
import { handlerCreateChirp, handlerDeleteChirp, handlerGetAllChirps, handlerGetSingleChirp } from "./api/chirpHandler.js";
import { handlerLogin } from "./api/loginHandler.js";
import { refreshToken, revokeTokenHandler } from "./api/auth.js";
import { handlerNewPassword } from "./api/newPasswordHandler.js";
import { handlerUpgradeUser } from "./api/upgradeHandler.js";
const app = express();
const PORT = 8080;
const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);
//use express JSON parsing middleware
app.use(express.json());
// counts all requests to /app
app.use("/app", (req, res, next) => {
    Promise.resolve(middlewareMetricsInc(req, res, next)).catch(next);
});
// any url
app.use((req, res, next) => {
    Promise.resolve(middlewareLogResponses(req, res, next)).catch(next);
});
app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerCreateUser(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerLogin(req, res)).catch(next);
});
//reports count to /metrics
app.use("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerReqCount(req, res)).catch(next);
});
//reset count
app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(reset(req, res)).catch(next);
});
//url, static(where its served from relative to node being launched)
app.use("/app", express.static("./src/app/"));
app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerCreateChirp(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerGetAllChirps(req, res)).catch(next);
});
app.get("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(handlerGetSingleChirp(req, res).catch(next));
});
app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(refreshToken(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(revokeTokenHandler(req, res)).catch(next);
});
app.put("/api/users", (req, res, next) => {
    Promise.resolve(handlerNewPassword(req, res)).catch(next);
});
// get chirpID with req.params.chirpID
app.delete("/api/chirps/:chirpID", (res, req, next) => {
    Promise.resolve(handlerDeleteChirp(res, req)).catch(next);
});
//upgrade user
app.post("/api/polka/webhooks", (req, res, next) => {
    Promise.resolve(handlerUpgradeUser(req, res).catch(next));
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
app.use(errorHandler);
