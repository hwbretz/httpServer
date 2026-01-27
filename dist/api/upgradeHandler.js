import { upgradeToChirpyRed } from "../lib/db/queries/users.js";
import { NotFoundError, UnauthorizedError } from "./errors.js";
import { getAPIKey } from "./auth.js";
import { config } from "../config.js";
export async function handlerUpgradeUser(req, res) {
    const apiKeyTest = getAPIKey(req);
    if (apiKeyTest !== config.api.apiKey) {
        throw new UnauthorizedError("bad api key");
    }
    const request = req.body;
    if (request.event !== "user.upgraded") {
        res.status(204).send();
    }
    else {
        try {
            const upgradedUser = await upgradeToChirpyRed(request.data.userId);
            res.status(204).send();
        }
        catch (err) {
            throw new NotFoundError("error with user data");
        }
    }
}
