import { Request, Response } from "express";
import { getBearerToken, hashPassword, validateJWT } from "./auth.js";
import { UnauthorizedError } from "./errors.js";
import { updateUserPasswordEmail } from "../lib/db/queries/users.js";
import { config } from "../config.js";

type UpdatePasswordBody = {
    password: string,
    email: string,
}
export async function handlerNewPassword(req: Request, res: Response) {
    let token;
    let subject;
    try{
        token = getBearerToken(req);
        subject = validateJWT(token, config.secret);
    } catch(err){
        throw new UnauthorizedError(" Invalid token or header")
    }
    
    const body: UpdatePasswordBody = req.body;

    if (!body.email || !body.password){
        throw new UnauthorizedError("Invalid request");
    }

    const hashed = await hashPassword(body.password);
    const updatedUser = await updateUserPasswordEmail(subject, hashed, body.email);

    if(updatedUser){
        res.status(200).send({
            "id": updatedUser.id,
            "createdAt": updatedUser.createdAt,
            "updatedAt": updatedUser.updatedAt,
            "email": updatedUser.email,
            "isChirpyRed": updatedUser.isChirpyRed,
        });
    }

};