import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from "jose";
const prisma = new PrismaClient();



const SelectCharacterMsg = z.object({
    jwt: z.string(),
    characterId: z.string()
});

/**
 * Takes in a jwt with a username, and either a predefined character or a asset id for a cNFT that's in their wallet
 */
export async function selectCharacter(req: Request, res: Response) {
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

        // When you join a room you're locked in to your selection
        if (user.clientId !== "") {
            throw new Error("Can't change characters while in a room!");
        }

        const character = await prisma.userCharacters.findFirst({
            where: {
                username: user.username,
                id: scInfo.characterId
            }
        })
        if (!character) {
            throw new Error("Character not found in User Inventory!")
        }

        const previouslySelectedCharacter = await prisma.userCharacters.findFirst({
            where: {
                username: user.username,
                selected: true
            }
        });

        if (previouslySelectedCharacter) {
            await prisma.userCharacters.update({
                where: {
                    id: previouslySelectedCharacter.id
                },
                data: {
                    selected: false
                }
            })
        }

        await prisma.userCharacters.update({
            where: {
                id: character.id,
            },
            data: {
                selected: true
            }
        })

        res.status(200).json({ success: true });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message })
    }
}