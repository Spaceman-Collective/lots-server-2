import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from "jose";
const prisma = new PrismaClient();



const SelectCharacterMsg = z.object({
    jwt: z.string(),
    characterAssetId: z.string() // Going to be either a predefined ID, or a pubkey for a cNFT
});

/**
 * Takes in a jwt with a username, and either a predefined character or a asset id for a cNFT that's in their wallet
 */
async function selectCharacter(req: Request, res: Response) {
    try {
        const scInfo = SelectCharacterMsg.parse(req.body);

        // Verify JWT and get Username

        const { payload } = await jwtVerify(
            scInfo.jwt,
            new TextEncoder().encode(process.env.SERVER_JWT_KEY)
        );
        const username = payload.username as string;
        // Fetch the User
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            throw new Error("User not found!")
        }

        // Check if CharacterAsset is a predefined Character
        if (!scInfo.characterAssetId.startsWith("character:")) {
            throw new Error("Only predefined characters allowed right now!")
        }

        const characterId = scInfo.characterAssetId.split(":")[1];
        // TODO: Check that it's a valid character ID!
        await prisma.user.update({
            where: { username: user.username },
            data: {
                selectedCharacter: characterId
            }
        })
        res.status(200).json({ success: true });
        // TODO: If AssetId is NOT predefined character, search their wallet to see if they have it

    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message })
    }
}