import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewUser, RefreshToken, refreshTokens, users } from "../schema.js";
import { BadRequestError, UnauthorizedError } from "../../../api/errors.js";


export async function createRefreshToken(user: NewUser, refToken: string) {
    const exp = addDays(Date.now(),60);
    const [result] = await db.insert(refreshTokens).values({token: refToken, userId: user.id, expiresAt: exp}).returning();

    return result;
}

function addDays (date: number, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export async function getToken(token: string) {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    if(!result || result.revokedAt || result.expiresAt.getTime() <= Date.now()){
        throw new UnauthorizedError("bad token; expired, revoked or nonextant");
    } else{
        return result;
    }
};

export async function getUserFromRefToken(refToken: RefreshToken) {
    if (!refToken || !refToken.userId){
        throw new BadRequestError("something wrong with refresh token");
    }
    const [result] = await db.select().from(users).where(eq(users.id,refToken.userId));
    if(!result){
        throw new BadRequestError("error getting user");
    } else {
        return result;
    }
}

export async function revokeToken(token: string){
    const result = await getToken(token);
    if(!result || !result.userId){
        throw new BadRequestError("Error fetching data");
    }
    let currTime = new Date();
    await db.update(refreshTokens).set({revokedAt: currTime}).where(eq(refreshTokens.userId, result.userId));
}
