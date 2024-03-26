/**
 * 1. Create an Account
 * 2. Login to the Account  -> Return data for Client
 */

import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { randomBytes } from 'crypto';
import { scryptSync } from 'crypto';
import { SignJWT } from "jose";
import { character as DEFAULT_CHARACTER } from "../characters/default";

const AccountMsg = z.object({
    username: z.string(),
    password: z.string(),
    walletPubkey: z.string().optional()
})

/**
 * Takes in a Username and Password, stores it using scrypt and wallet pubkey as the salt
 */
export async function createAccount(req: Request, res: Response) {
    try {
        const createAccountInfo = AccountMsg.parse(req.body);
        // Check user name is not already taken
        const user = await prisma.user.findUnique({ where: { username: createAccountInfo.username } });
        if (user) {
            throw new Error("Username already exists")
        }

        const userSalt = randomBytes(64).toString("hex");

        // Use the Pubkey as salt and save login info to database
        const passwordHash = scryptSync(createAccountInfo.password, userSalt, 64).toString("hex");
        await prisma.user.create({
            data: {
                username: createAccountInfo.username,
                displayName: createAccountInfo.username,
                userSalt: userSalt,
                passwordHash: passwordHash,
                walletPubkey: createAccountInfo.walletPubkey ? createAccountInfo.walletPubkey : "",
                clientId: ""
            }
        });

        await prisma.userCharacters.create({
            data: {
                username: user.username,
                selected: true,
                amount: -1,
                vitals: DEFAULT_CHARACTER.vitals,
                stats: DEFAULT_CHARACTER.stats,
                skills: DEFAULT_CHARACTER.skills,
                inventory: DEFAULT_CHARACTER.inventory,
                worn: DEFAULT_CHARACTER.worn
            }
        })

        res.status(200).json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
}

/**
 * Takes in a username/password and returns a JWT that can be used for auth through WS API
 */
export async function login(req: Request, res: Response) {
    try {
        const loginInfo = AccountMsg.parse(req.body);
        // Check user name is not already taken
        const user = await prisma.user.findUnique({ where: { username: loginInfo.username } });
        if (!user) {
            throw new Error("User doesn't exist")
        }
        const pHash = scryptSync(loginInfo.password, user.walletPubkey, 64).toString("hex");
        if (user.passwordHash !== pHash) {
            throw new Error("Incorrect Password!")
        }

        const jwt = await new SignJWT({
            username: user.username,
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("12h")
            .sign(new TextEncoder().encode(process.env.SERVER_JWT_KEY));

        res.status(200).json({ success: true, jwt });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
}