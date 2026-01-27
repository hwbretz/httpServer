import { getUserByEmail } from "../lib/db/queries/users.js";
import { UnauthorizedError } from "./errors.js";
import { checkPassword, makeJWT, makeRefreshToken } from "./auth.js";
import { config } from "../config.js";
import { createRefreshToken } from "../lib/db/queries/refTokens.js";
export async function handlerLogin(req, res) {
    const loginReq = req.body;
    loginReq.expiresInSeconds = 3600;
    const userCheck = await getUserByEmail(loginReq.email);
    if (!userCheck) {
        throw new UnauthorizedError("Incorrect email or password");
    }
    else {
        const hash = userCheck.hashedPassword;
        const verified = await checkPassword(loginReq.password, hash);
        if (!verified) {
            throw new UnauthorizedError("Incorrect email or password");
        }
        const sendUser = {
            "id": userCheck.id,
            "createdAt": userCheck.createdAt,
            "updatedAt": userCheck.updatedAt,
            "email": userCheck.email,
            "isChirpyRed": userCheck.isChirpyRed,
        };
        const token = makeJWT(sendUser.id, loginReq.expiresInSeconds, config.secret);
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
