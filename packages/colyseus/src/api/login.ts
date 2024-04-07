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
import { getRandomCharacter } from "../characters/util";

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
                clientId: 'not_logged_in'
            }
        });

        let commonChar = getRandomCharacter(0);
        commonChar.username = createAccountInfo.username;
        commonChar.selected = true;

        await prisma.userCharacters.create({ data: commonChar })

        const vault = Array(50).fill({ itemId: "", amount: 0 });
        vault[0] = {
            itemId: "armor_black",
            amount: 1
        };
        vault[1] = {
            itemId: "health_potion",
            amount: 3
        };
        vault[2] = {
            itemId: "arrow",
            amount: 25
        };
        vault[3] = {
            itemId: "hex_bag",
            amount: 2
        };
        vault[4] = {
            itemId: "gun",
            amount: 1
        };
        vault[5] = {
            itemId: "sword",
            amount: 1
        };
        vault[6] = {
            itemId: "book",
            amount: 1
        };


        await prisma.userEquipment.create({
            data: {
                username: createAccountInfo.username,
                inventory: { items: Array(20).fill({ itemId: "", amount: 0 }) },
                worn: {
                    head: "",
                    torso: "",
                    legs: "",
                    boots: "",
                    mainhand: "",
                    offhand: "",
                },
                vault
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
        const pHash = scryptSync(loginInfo.password, user.userSalt, 64).toString("hex");
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