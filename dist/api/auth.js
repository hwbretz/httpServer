import { hash, verify } from "argon2";
import jwt from "jsonwebtoken";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { randomBytes } from "node:crypto";
import { getToken, getUserFromRefToken, revokeToken } from "../lib/db/queries/refTokens.js";
import { config } from "../config.js";
export async function hashPassword(password) {
    const hashed = await hash(password);
    return hashed;
}
;
export async function checkPassword(password, hash) {
    const verified = await verify(hash, password);
    return verified;
}
;
export function makeJWT(userID, expiresIn, secret) {
    const iat = Math.floor(Date.now() / 1000);
    const jwtPayload = {
        iss: "chirpy",
        sub: userID,
        iat: iat,
        exp: iat + expiresIn,
    };
    const token = jwt.sign(jwtPayload, secret);
    return token;
}
;
export function validateJWT(tokenString, secret) {
    try {
        const decoded = jwt.verify(tokenString, secret);
        //sub as in subject is userid
        return decoded.sub;
    }
    catch (err) {
        throw new UnauthorizedError("invalid token");
    }
}
;
export function getBearerToken(req) {
    const header = req.get('Authorization');
    if (!header || !header.includes("Bearer")) {
        throw new BadRequestError("missing or bad header");
    }
    else {
        const token = header.split(" ");
        return token[1];
    }
}
;
export function makeRefreshToken() {
    const buf = randomBytes(256);
    return buf.toString("hex");
}
export async function refreshToken(req, res) {
    const oldToken = getBearerToken(req);
    const refToken = await getToken(oldToken);
    const user = await getUserFromRefToken(refToken);
    const newToken = makeJWT(user.id, 3600, config.secret);
    res.status(200).send({ "token": newToken });
}
export async function revokeTokenHandler(req, res) {
    const token = getBearerToken(req);
    await revokeToken(token);
    res.status(204).send();
}
export function getAPIKey(req) {
    const header = req.get('Authorization');
    if (!header || !header.includes("ApiKey")) {
        throw new UnauthorizedError("Unauthorized API access");
    }
    else {
        const apiKey = header.split(" ");
        return apiKey[1];
    }
}
