/**
 * 1. Create an Account
 * 2. Login to the Account  -> Return data for Client
 */

import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { Keypair } from '@solana/web3.js';
import { scryptSync } from 'crypto';
import { encode } from 'bs58';
import { SignJWT } from "jose";

const AccountMsg = z.object({
    username: z.string(),
    password: z.string(),
})

/**
 * Takes in a Username and Password, stores it using scrypt and wallet pubkey as the salt
 */
async function createAccount(req: Request, res: Response) {
    try {
        const createAccountInfo = AccountMsg.parse(req.body);
        // Check user name is not already taken
        const user = await prisma.user.findUnique({ where: { username: createAccountInfo.username } });
        if (user) {
            throw new Error("Username already exists")
        }

        // Generate a private/pubkey keypair
        const newUserWallet = Keypair.generate();

        // Use the Pubkey as salt and save login info to database
        const passwordHash = scryptSync(createAccountInfo.password, newUserWallet.publicKey.toString(), 64).toString("hex");
        await prisma.user.create({
            data: {
                username: createAccountInfo.username,
                displayName: createAccountInfo.username,
                passwordHash: passwordHash,
                walletPubkey: newUserWallet.publicKey.toString(),
                linkedKeys: [],
                selectedCharacter: "",
                clientId: ""
            }
        });

        // TODO: Secure this somehow?
        await prisma.wallet.create({
            data: {
                pubkey: newUserWallet.publicKey.toString(),
                privatekey: encode(newUserWallet.secretKey)
            }
        });

        res.status(200).json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
}

/**
 * Takes in a username/password and returns a JWT that can be used for auth through WS API
 */
async function login(req: Request, res: Response) {
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