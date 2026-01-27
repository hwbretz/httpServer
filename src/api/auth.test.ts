import { describe, it, expect, beforeAll} from "vitest";
import { checkPassword, getAPIKey, getBearerToken, hashPassword, makeJWT, validateJWT } from "./auth.js";
import { Request, Response } from "express";
import { stringify } from "node:querystring";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPassword(password1, hash1);
    expect(result).toBe(true);
  });
  it("should return true for the correct password", async () => {
    const result = await checkPassword(password2, hash2);
    expect(result).toBe(true);
  });
});

describe("JWT", () => {
    const jwtOne = makeJWT("123456", 100, "secret");
    const jwtTwo = makeJWT("789101112", 200, "secret");

    it("should return true for jsonwebtokens", () => {
        const result = validateJWT(jwtOne, "secret");
        expect(result).toEqual("123456");
    });
    it("should return true for jsonwebtokens", () => {
        const result = validateJWT(jwtTwo, "secret");
        expect(result).toEqual("789101112");
    });
});

describe("getBearerToken", () => {
    const reqOne = {
        get: (arg: string) => {
             if (arg === "Authorization"){
                return "Bearer TOKEN";
             }
        },
    } as Request;

    it("should return true for good token", () => {
        const result = getBearerToken(reqOne);
        expect(result).toEqual("TOKEN");
    });
});

describe("getBADBearerToken", () => {
    const reqOne = {
        get: (arg: string) => {
             if (arg === "Authorization"){
                return ;
             } else {
               return "Bearer TOKEN";
             }
        },
    } as Request;

    it("should return true for good token", () => {
        expect(() =>getBearerToken(reqOne)).toThrow("error");
    });
});

describe("getGoodApiKey", () => {
    const reqOne = {
        get: (arg: string) => {
            if(arg === "Authorization"){
                return "ApiKey 123456abcdef";
            }
        }
    } as Request;

    it("return true for apikey match", () => {
        const result = getAPIKey(reqOne);
        expect(result).toEqual("123456abcdef");
    })
});