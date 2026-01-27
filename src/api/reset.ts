import { Request, Response } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "./errors.js";
import { resetRows } from "../lib/db/queries/users.js";

export async function reset(req: Request, res: Response){
    const platform = config.api.platform;

    if(platform != "dev"){
        throw new ForbiddenError("Not accessible");
    } else{
        await resetRows();
        res.status(200).send("users reset");
    }
}