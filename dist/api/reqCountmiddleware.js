import { reqCount } from "../config.js";
export async function middlewareMetricsInc(req, res, next) {
    reqCount.fileServerHits += 1;
    next();
}
export async function handlerReqCount(req, res) {
    res.set({
        'Content-Type': 'text/html; charset=utf-8'
    });
    res.send(`<html>
                <body>
                    <h1>Welcome, Chirpy Admin</h1>
                    <p>Chirpy has been visited ${reqCount.fileServerHits} times!</p>
                </body>
                </html>`);
}
;
export async function handlerResetReqCount(req, res) {
    reqCount.fileServerHits = 0;
    res.send();
}
