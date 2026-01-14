import { Request, Response } from "express";
import {reqCount} from "../config.js"

export async function middlewareMetricsInc(req: Request, res: Response, next: Function) {
    reqCount.fileServerHits += 1;
    next();
}

export async function handlerReqCount (req: Request, res: Response) : Promise<void> {
    res.set({
        'Content-Type': 'text/html; charset=utf-8'
    })
    
    res.send(`<html>
                <body>
                    <h1>Welcome, Chirpy Admin</h1>
                    <p>Chirpy has been visited ${reqCount.fileServerHits} times!</p>
                </body>
                </html>`);
};

export async function handlerResetReqCount (req: Request, res: Response) : Promise<void> {
    reqCount.fileServerHits = 0;
    res.send();
}