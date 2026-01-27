import { Request, Response } from "express";
import {config} from "../config.js"

export async function middlewareMetricsInc(req: Request, res: Response, next: Function) {
    config.api.fileServerHits += 1;
    next();
}

export async function handlerReqCount (req: Request, res: Response) : Promise<void> {
    res.set({
        'Content-Type': 'text/html; charset=utf-8'
    })
    
    res.send(`<html>
                <body>
                    <h1>Welcome, Chirpy Admin</h1>
                    <p>Chirpy has been visited ${config.api.fileServerHits} times!</p>
                </body>
            </html>`);
};

export async function handlerResetReqCount (req: Request, res: Response) : Promise<void> {
    config.api.fileServerHits = 0;
    res.send();
}