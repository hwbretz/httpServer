import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
import { createChirp, deleteChirp, getAllChirps, getChirpById } from "../lib/db/queries/chirps.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "../config.js";
import { getUserById } from "../lib/db/queries/users.js";
export async function handlerCreateChirp(req, res) {
    const token = getBearerToken(req);
    const parsedBody = req.body;
    const userID = validateJWT(token, config.secret);
    res.header("Content-Type", "application/json");
    if (parsedBody.body.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }
    else {
        const profanityCheck = parsedBody.body.split(" ");
        for (let idx = 0; idx < profanityCheck.length; idx++) {
            let word = profanityCheck[idx].toLowerCase();
            if (word === "kerfuffle" || word === "sharbert" || word === "fornax") {
                word = "****";
                profanityCheck[idx] = word;
            }
        }
        ;
        const editedBody = profanityCheck.join(" ");
        const newChirp = {
            body: editedBody,
            userId: userID
        };
        const chirp = await createChirp(newChirp);
        res.header("Content-Type", "application/json");
        //res.status(201).send(chirp);
        res.status(201).send({
            "id": chirp.id,
            "createdAt": chirp.createdAt,
            "updatedAt": chirp.updatedAt,
            "body": chirp.body,
            "userId": chirp.userId
        });
    }
}
;
export async function handlerGetAllChirps(req, res) {
    let userId = "";
    let idQuery = req.query.authorId;
    if (typeof idQuery === "string") {
        userId = idQuery;
    }
    //default
    let sort = "asc";
    let sortQuery = req.query.sort;
    if (typeof sortQuery === "string") {
        sort = sortQuery;
    }
    let chirps;
    if (userId.length > 0) {
        chirps = await getAllChirps(sort, userId);
    }
    else {
        chirps = await getAllChirps(sort);
    }
    res.header("Content-Type", "application/json");
    res.status(200).send(chirps);
}
;
export async function handlerGetSingleChirp(req, res) {
    const chirpsId = req.params.chirpID;
    if (!chirpsId) {
        throw new BadRequestError("Error Invalid Request, missing ChirpID");
    }
    else {
        const chirp = await getChirpById(chirpsId);
        if (!chirp) {
            throw new NotFoundError("Chirp not found.");
        }
        else {
            res.send({
                "id": chirp.id,
                "createdAt": chirp.createdAt,
                "updatedAt": chirp.updatedAt,
                "body": chirp.body,
                "userId": chirp.userId
            });
        }
    }
}
export async function handlerDeleteChirp(req, res) {
    let token;
    let subject;
    try {
        token = getBearerToken(req);
        subject = validateJWT(token, config.secret);
    }
    catch (err) {
        throw new UnauthorizedError(" Invalid token or header");
    }
    const chirpID = req.params.chirpID;
    const chirp = await getChirpById(chirpID);
    const user = await getUserById(subject);
    if (user.id != chirp.userId) {
        throw new ForbiddenError("User cannot delete another users chirp");
    }
    if (!chirp) {
        throw new NotFoundError("chirp not found");
    }
    await deleteChirp(chirp);
    res.status(204).send();
}
