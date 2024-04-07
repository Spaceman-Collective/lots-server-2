import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from "jose";
import { plainToInstance } from "class-transformer";
import { ActorSchema, InventorySchema } from "../schema/Actor";
const prisma = new PrismaClient();


const AuthMsg = z.object({
    jwt: z.string()
});

export async function getUser(req: Request, res: Response) {
    try {
        const { jwt } = AuthMsg.parse(req.body);
        const { payload } = await jwtVerify(
            jwt,
            new TextEncoder().encode(process.env.SERVER_JWT_KEY)
        );
        const username = payload.username as string;

        const user = await prisma.user.findUniqueOrThrow({ where: { username } });

        const characters = await prisma.userCharacters.findMany({
            where: { username }
        });

        const equipment = await prisma.userEquipment.findUnique({
            where: { username }
        })

        const selectedCharacter = characters.find(x => x.selected == true);
        let selectedActor;
        if (selectedCharacter) {
            selectedActor = plainToInstance(ActorSchema, {
                x: 0,
                y: 0,
                vitals: selectedCharacter.vitals,
                stats: selectedCharacter.stats,
                skills: selectedCharacter.skills,
                inventory: { items: [] },
                worn: equipment.worn,
                isAlive: true,
            })
            await selectedActor.processEquipment()
        }

        res.status(200).json({ success: true, characters, equipment, selectedActor: { vitals: selectedActor.vitals.toJSON(), stats: selectedActor.stats.toJSON(), skills: selectedActor.skills.toJSON() }, user: { skin: user.characterSkin, displayName: user.displayName } });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
}