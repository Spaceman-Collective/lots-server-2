import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from "jose";
const prisma = new PrismaClient();
import { ShyftSdk, Network } from "@shyft-to/js";
const shyft = new ShyftSdk({
    apiKey: process.env.SHYFT_KEY as string,
    network: Network.Mainnet
})


/**
 * Takes in a burn cNFT txn id, and credits it to the account, storing the last 7 days of burns in a database
 * If the txn is older than 7 days it cannot be redeemed.
 * If it has already been creditted, it cannot be redeemed.
 */
const InjectMsg = z.object({
    jwt: z.string(),
    cnft_address: z.string(),
})
async function inject(req: Request, res: Response) {
    try {
        const msg = InjectMsg.parse(req.body);
        const { payload } = await jwtVerify(
            msg.jwt,
            new TextEncoder().encode(process.env.SERVER_JWT_KEY)
        );
        const username = payload.username as string;

        // Check if cNFT has already been redeemed


        // Check if cNFT has been burned
        let nft;
        try {
            nft = await shyft.nft.compressed.read({ mint: msg.cnft_address });
        } catch (e: any) {
            throw new Error("Couldn't fetch cNFT!");
        }
        if (!nft.is_burnt) {
            throw new Error("This needs to be burnt to be creditted!")
        }

    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message })
    }
}

/**
 * Mints a new cNFT 
 */
async function eject(req: Request, res: Response) {
    try {
        // cant eject selected character
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message })
    }
}


/*
async function main() {
    const nft = await shyft.nft.compressed.read({ mint: "3zquRpAF2gtLmQ4nSy5UgcvHezaVdsoNdut4kpQayMzW" })
    console.log(nft);
}

main();
*/