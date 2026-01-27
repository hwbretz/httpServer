import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { NewUser } from "../lib/db/schema";
import { createUser } from "../lib/db/queries/users.js";
import { hashPassword } from "./auth.js";

type newUserRequest = {
    password: string,
    email: string
}
export async function handlerCreateUser(req: Request, res: Response) {
    const newUserReq: newUserRequest = req.body;
    const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if(!newUserReq.email || !emailRegex.test(newUserReq.email)) {
        throw new BadRequestError("input doesnt match email format.");
    } else if (!newUserReq.password || newUserReq.password.length < 1){
        throw new BadRequestError("bad password");
    }   
    
    else {

        const user: NewUser = {
            hashedPassword: await hashPassword(newUserReq.password),
            email: newUserReq.email,
        }

        const newUser = await createUser(user);
        
        type userSansPW = Omit<NewUser,"hashedPassword">;
        const sendUser: userSansPW = {
            "id": newUser.id,
            "createdAt": newUser.createdAt,
            "updatedAt": newUser.updatedAt,
            "email": newUser.email,
            "isChirpyRed": newUser.isChirpyRed,
        };

        res.status(201).send(sendUser);
    }

}