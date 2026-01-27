import { desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps } from "../schema.js";
import { BadRequestError } from "../../../api/errors.js";
export async function createChirp(newChirp) {
    const [result] = await db.insert(chirps).values(newChirp).onConflictDoNothing().returning();
    return result;
}
export async function getAllChirps(sort, userId) {
    let result;
    if (userId) {
        if (sort === "desc") {
            result = await db.select().from(chirps).where(eq(chirps.userId, userId)).orderBy(desc(chirps.createdAt));
        }
        else {
            result = await db.select().from(chirps).where(eq(chirps.userId, userId)).orderBy(chirps.createdAt);
        }
    }
    else {
        if (sort === "desc") {
            result = await db.select().from(chirps).orderBy(desc(chirps.createdAt));
        }
        else {
            result = await db.select().from(chirps).orderBy(chirps.createdAt);
        }
    }
    return result;
}
export async function getChirpById(chirpId) {
    const [result] = await db.select().from(chirps).where(eq(chirps.id, chirpId));
    return result;
}
export async function deleteChirp(chirp) {
    if (!chirp || !chirp.id) {
        throw new BadRequestError("something went wrong");
    }
    await db.delete(chirps).where(eq(chirps.id, chirp.id));
}
