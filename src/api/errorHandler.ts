import { Request, Response } from "express";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";

export async function errorHandler(err: Error,  req: Request,  res: Response,  next: Function){
    console.error(`ERROR: ${err.message}`);
    if (err instanceof BadRequestError){
        res.status(400).send({error: `${err.message}`});
    } else if (err instanceof UnauthorizedError){
        res.status(401).send({error: `${err.message}`});
    } else if (err instanceof ForbiddenError){
        res.status(403).send({error: `${err.message}`});
    } else if (err instanceof NotFoundError){
        res.status(404).send({error: `${err.message}`});
    } else {
        res.status(500).json({error: "Something went wrong on our end"});
    }
};
