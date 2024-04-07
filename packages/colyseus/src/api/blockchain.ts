import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from "jose";
const prisma = new PrismaClient();
import { ShyftSdk, Network } from "@shyft-to/js";
import { plainToInstance } from "class-transformer";
import { ItemSchema } from "../schema/Item";
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
    burn_txn: z.string(),
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
        const redeemed = await prisma.injectionCredits.findFirst({ where: { cnft: msg.cnft_address } });
        if (redeemed) {
            throw new Error("Already redeemed!");
        }

        // check if the txn is older than a week
        const txn = await shyft.transaction.parsed({ txnSignature: msg.burn_txn });
        const txnDate = new Date(txn.timestamp).getDate();
        const today = new Date().getDate();
        if (((today - txnDate) / (1000 * 60 * 60 * 24)) > 7) {
            throw new Error("Burn Txn is older than 7 days!")
        }

        const cnftBurnAction = txn.actions.find((action) => {
            if (action.type == "COMPRESSED_NFT_BURN" && (action.info as COMPRESSED_NFT_BURN).nft_address == msg.cnft_address) {
                return true;
            } else {
                return false;
            }
        });

        if (!cnftBurnAction) {
            throw new Error("Burn TXN and CNFT address don't match!");
        }

        const cnft = await shyft.nft.compressed.read({ mint: msg.cnft_address });
        const type = cnft.attributes['CTYPE'];

        if (type == "ITEM") {
            const itemId = cnft.attributes['itemId'];
            const item = await prisma.itemLibrary.findUnique({ where: { id: itemId as string } });
            if (!item) {
                throw new Error("Item not found!");
            }

            // Add this item with full stack size (since only full stack sizes can be ejected) to the user vault
            let userEquipment = await prisma.userEquipment.findUnique({ where: { username } });
            const bareItem = plainToInstance(ItemSchema, item.data);
            (userEquipment.vault as { itemId: string, amount: number }[]).push({ itemId: item.id, amount: bareItem.stackSize });
            const updatedUserEquipment = await prisma.userEquipment.update({
                where: {
                    username
                },
                data: {
                    vault: userEquipment.vault
                }
            });

            res.status(200).json({ success: true, userEquipment: updatedUserEquipment });
        } else if (type == "CHARACTER") {
            // TODO
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


interface COMPRESSED_NFT_BURN {
    tree_authority: string;
    merkle_tree: string;
    owner: string;
    nft_address: string;
    update_authority: string;
}


async function main() {
    const nft = await shyft.nft.compressed.read({ mint: "3zquRpAF2gtLmQ4nSy5UgcvHezaVdsoNdut4kpQayMzW" }) //r4rwGbquBx7iZ1KgThnKgGW2Y5zWaLeZd1Pmt8uxhrJE368EuWCZL7UkH9M2vy3ybBtNaAG125zyUZch2gZgMxH
    console.log(nft);

    const txn = await shyft.transaction.parsed({ txnSignature: "r4rwGbquBx7iZ1KgThnKgGW2Y5zWaLeZd1Pmt8uxhrJE368EuWCZL7UkH9M2vy3ybBtNaAG125zyUZch2gZgMxH" });
    console.log(txn);

    const date = new Date(txn.timestamp);
    console.log(Math.abs(new Date().getDate() - date.getDate()) / (1000 * 60 * 60 * 24));
}

main();