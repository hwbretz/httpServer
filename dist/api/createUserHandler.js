import { BadRequestError } from "./errors.js";
import { createUser } from "../lib/db/queries/users.js";
import { hashPassword } from "./auth.js";
export async function handlerCreateUser(req, res) {
    const newUserReq = req.body;
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!newUserReq.email || !emailRegex.test(newUserReq.email)) {
        throw new BadRequestError("input doesnt match email format.");
    }
    else if (!newUserReq.password || newUserReq.password.length < 1) {
        throw new BadRequestError("bad password");
    }
    else {
        const user = {
            hashedPassword: await hashPassword(newUserReq.password),
            email: newUserReq.email,
        };
        const newUser = await createUser(user);
        const sendUser = {
            "id": newUser.id,
            "createdAt": newUser.createdAt,
            "updatedAt": newUser.updatedAt,
            "email": newUser.email,
            "isChirpyRed": newUser.isChirpyRed,
        };
        res.status(201).send(sendUser);
    }
}
