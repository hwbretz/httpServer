import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { Request, Response } from "express";
import { randomBytes } from "node:crypto";
import { getToken, getUserFromRefToken, revokeToken } from "../lib/db/queries/refTokens.js";
import { config } from "../config.js";

export async function hashPassword(password: string):Promise<string> {
    const hashed = await hash(password);
    return hashed;
};

export async function checkPassword(password: string, hash: string): Promise<boolean> {
    const verified = await verify(hash,password);
    return verified;
};

type JwtPayload = {
    iss: string; //"chirpy"
    sub: string; //userID
    iat: number; //Math.floor(Date.now() / 1000)
    exp: number; //iat + expiresIn
};

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
    type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;
    const iat = Math.floor(Date.now() / 1000);
    const jwtPayload: payload = {
        iss : "chirpy",
        sub : userID,
        iat : iat,
        exp : iat + expiresIn,
    }
    const token = jwt.sign(jwtPayload, secret);
    return token;
};

export function validateJWT(tokenString: string, secret: string): string {
    try {
        const decoded = jwt.verify(tokenString, secret);
        //sub as in subject is userid
        return decoded.sub as string;
    } catch (err) {
        throw new UnauthorizedError("invalid token");
    }
};

export function getBearerToken(req: Request) : string {
    const header = req.get('Authorization');
    if (!header || !header.includes("Bearer")){
        throw new BadRequestError("missing or bad header");
    } else {
        const token = header.split(" ");
        return token[1];
    }

};

export function makeRefreshToken() {
    const buf = randomBytes(256);

    return buf.toString("hex");
}

export async function refreshToken(req: Request, res: Response) {
    const oldToken = getBearerToken(req);
    const refToken = await getToken(oldToken);
    const user = await getUserFromRefToken(refToken);
    const newToken = makeJWT(user.id, 3600, config.secret);

    res.status(200).send({"token" : newToken});

}


export async function revokeTokenHandler(req: Request, res: Response){
    const token = getBearerToken(req);
    await revokeToken(token);

    res.status(204).send();
}

export function getAPIKey(req: Request) : string {
    const header = req.get('Authorization');
    if(!header || !header.includes("ApiKey")){
        throw new UnauthorizedError("Unauthorized API access");
    } else {
        const apiKey = header.split(" ");
        return apiKey[1];
    }
}