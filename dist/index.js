import express from "express";
import { handlerReadiness } from "./api/readiness.js";
import { middlewareLogResponses } from "./api/nonOKmiddleware.js";
import { handlerReqCount, handlerResetReqCount, middlewareMetricsInc } from "./api/reqCountmiddleware.js";
const app = express();
const PORT = 8080;
app.listen();
// counts all requests to /app
app.use("/app", middlewareMetricsInc);
// any url
app.use(middlewareLogResponses);
//reports count to /metrics
app.use("/admin/metrics", handlerReqCount);
//reset count
app.use("/admin/reset", handlerResetReqCount);
//url, static(where its served from relative to node being launched)
app.use("/app", express.static("./src/app/"));
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
app.get("/api/healthz", handlerReadiness);
