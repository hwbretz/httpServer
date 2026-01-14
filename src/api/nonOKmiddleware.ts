import { Request, Response } from "express";
export async function middlewareLogResponses(req: Request, res: Response, next: Function): Promise<void>{
    res.on("finish", () => {
        const statusCode = res.statusCode;
        if (statusCode !== 200){
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
        }
    })
    next();
}