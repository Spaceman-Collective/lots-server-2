import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from "jose";
import { plainToInstance } from "class-transformer";
import { WornItemSchema } from "../schema/Item";
import { checkRequirements } from "../handlers/item";
import { SkillsSchema } from "../schema/ActorInfo";
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

        const userEquipment = await prisma.userEquipment.findUnique({ where: { username } });
        // TODO don't allow selection if any of the equipped items requirements are not met
        const items = await prisma.itemLibrary.findMany({
            where: {
                id: {
                    in: [
                        (userEquipment.worn as any).head ? (userEquipment.worn as any).head : undefined,
                        (userEquipment.worn as any).torso ? (userEquipment.worn as any).torso : undefined,
                        (userEquipment.worn as any).legs ? (userEquipment.worn as any).legs : undefined,
                        (userEquipment.worn as any).boots ? (userEquipment.worn as any).boots : undefined,
                        (userEquipment.worn as any).mainhand ? (userEquipment.worn as any).mainhand : undefined,
                        (userEquipment.worn as any).offhand ? (userEquipment.worn as any).offhand : undefined
                    ].filter((x) => x != undefined)
                }
            }
        })

        for (let item of items) {
            const wornItem = plainToInstance(WornItemSchema, item.data);
            if (!checkRequirements(wornItem.requirements, plainToInstance(SkillsSchema, character.skills))) {
                throw new Error(`New selection doesn't have requirements to wear current loadout. Offending item: ${wornItem.wornArea}`)
            }
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

const SelectSkinMsg = z.object({
    jwt: z.string(),
    newSkin: z.enum(["788", "8667"]),
})
export async function selectSkin(req: Request, res: Response) {
    try {
        const { jwt, newSkin } = SelectSkinMsg.parse(req.body);
        const { payload } = await jwtVerify(
            jwt,
            new TextEncoder().encode(process.env.SERVER_JWT_KEY)
        );
        const username = payload.username as string;

        const user = await prisma.user.update({
            where: { username },
            data: {
                characterSkin: newSkin
            }
        })

        res.status(200).json({ success: true, user });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message })
    }
}