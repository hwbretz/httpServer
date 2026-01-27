import { eq } from "drizzle-orm";
import {db} from "../index.js";
import { NewUser, users } from "../schema.js";
import { BadRequestError } from "../../../api/errors.js";

export async function createUser(user: NewUser) {
   
  const userCheck = await getUserByEmail(user.email);

  if(!userCheck){
    const [result] = await db.insert(users).values(user).onConflictDoNothing().returning();
    return result;
  } else{
    throw new BadRequestError("User already in database");
  }
}

export async function getUserByEmail(email: string){
  const [result] = await db.select().from(users).where(eq(users.email,email));
  return result;
}

export async function getUserById(id: string){
  const [result] = await db.select().from(users).where(eq(users.id,id));
  if(!result){
    throw new BadRequestError("user not found");
  }
  return result;
}

export async function resetRows() {
  await db.delete(users);
  return;
};

export async function updateUserPasswordEmail(userId: string, hashPassword: string, email: string){
  if(!userId || !hashPassword || !email){
    throw new BadRequestError("error with user data");
  }
  const [result] = await db.update(users).set({email: email, hashedPassword: hashPassword }).where(eq(users.id, userId)).returning();
  return result;
};

export async function upgradeToChirpyRed(userId: string){
  const user = await getUserById(userId);
  const [result] = await db.update(users).set({isChirpyRed: true}).where(eq(users.id,user.id)).returning();
  return result;
}