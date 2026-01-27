import { config } from "../config.js";
export async function middlewareMetricsInc(req, res, next) {
    config.api.fileServerHits += 1;
    next();
}
export async function handlerReqCount(req, res) {
    res.set({
        'Content-Type': 'text/html; charset=utf-8'
    });
    res.send(`<html>
                <body>
                    <h1>Welcome, Chirpy Admin</h1>
                    <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
                </body>
            </html>`);
}
;
export async function handlerResetReqCount(req, res) {
    config.api.fileServerHits = 0;
    res.send();
}
