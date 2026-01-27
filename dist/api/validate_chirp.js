import { BadRequestError } from "./errors.js";
export async function handlerValidateChirp(req, res) {
    const parsedBody = req.body;
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
        res.header("Content-Type", "application/json");
        res.status(200).send({ cleanedBody: editedBody });
    }
}
