import { Request, Response } from "express";
import { z } from "zod";
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from "jose";
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

        const characters = await prisma.userCharacters.findMany({
            where: { username }
        });

        const equipment = await prisma.userEquipment.findUnique({
            where: { username }
        })

        res.status(200).json({ success: true, characters, equipment });
    } catch (e: any) {
        res.status(500).json({ success: false, error: e.message });
    }
}