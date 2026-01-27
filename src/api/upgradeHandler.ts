import { Request, Response } from "express";
import { upgradeToChirpyRed } from "../lib/db/queries/users.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./errors.js";
import { getAPIKey } from "./auth.js";
import { config } from "../config.js";

type UpgradeBody = {
    event:  string,
    data: {
        userId: string,
    }
}

export async function handlerUpgradeUser(req: Request, res: Response){

    const apiKeyTest = getAPIKey(req);
    if(apiKeyTest !== config.api.apiKey){
        throw new UnauthorizedError("bad api key");
    }
    const request: UpgradeBody = req.body;

    if(request.event !== "user.upgraded"){
        res.status(204).send();
    } else {
        try{
            const upgradedUser = await upgradeToChirpyRed(request.data.userId);
            res.status(204).send();
        } catch (err) {
            throw new NotFoundError("error with user data");
        }
    }
}