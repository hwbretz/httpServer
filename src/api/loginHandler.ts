import { Request, Response } from "express";
import { getUserByEmail } from "../lib/db/queries/users.js";
import { UnauthorizedError } from "./errors.js";
import { checkPassword, hashPassword, makeJWT, makeRefreshToken } from "./auth.js";
import { NewUser } from "../lib/db/schema.js";
import { config } from "../config.js";
import { createRefreshToken } from "../lib/db/queries/refTokens.js";

type loginRequest = {
    password: string,
    email: string,
    expiresInSeconds?: number,
}

export async function handlerLogin(req: Request, res: Response) {

    const loginReq: loginRequest = req.body;
  
    loginReq.expiresInSeconds = 3600;
    const userCheck = await getUserByEmail(loginReq.email);
    
    if(!userCheck ){
        throw new UnauthorizedError("Incorrect email or password");
    } else {
        const hash = userCheck.hashedPassword;
        const verified = await checkPassword(loginReq.password,hash);
        if( !verified){
            throw new UnauthorizedError("Incorrect email or password");
        }
        type userSansPW = Omit<NewUser,"hashedPassword">;
        const sendUser: userSansPW = {
            "id": userCheck.id,
            "createdAt": userCheck.createdAt,
            "updatedAt": userCheck.updatedAt,
            "email": userCheck.email,
            "isChirpyRed": userCheck.isChirpyRed,
        };

        const token = makeJWT(sendUser.id as string, loginReq.expiresInSeconds, config.secret);
        const refToken = makeRefreshToken();
        createRefreshToken(userCheck, refToken);

        res.status(200).send({
            "id": userCheck.id,
            "createdAt": userCheck.createdAt,
            "updatedAt": userCheck.updatedAt,
            "email": userCheck.email,
            "isChirpyRed": userCheck.isChirpyRed,
            "token": token,
            "refreshToken": refToken
        });

    }
}