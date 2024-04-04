import { PrismaClient, ItemLibrary } from '@prisma/client';
const prisma = new PrismaClient();

const wornItems: ItemLibrary[] = [
    {
        id: "armor_black",
        type: "worn",
        img: "Armor_Black.png",
        model: "Armor_Black.fbx",
        animation: "not_animated",
        data: {
            guid: "armor_black",
            itemType: "WORN",
            stackSize: 1,
            requirements: {
                fighting: 0,
                ranged: 0,
                magic: 0,
                tech: 0,
                firearms: 0
            },
            wornArea: "torso",
            wornVitalsModified: {
                health: 0,
                healthMax: 0,
                healthRecovery: 0,
                shields: 0,
                shieldsMax: 0,
                shieldsRecovery: 0,
                armor: 0,
                armorMax: 100,
                armorRecovery: 2,
            },
            wornStatsModfied: {}
        },
        dropAmt: 1
    }
]

const buffItems: ItemLibrary[] = [
    {
        id: "health_potion",
        type: "buff",
        img: "Potion1_Filled_Red.png",
        model: "Potion1_Filled_Red.fbx",
        animation: "not_animated",
        data: {
            guid: "health_potion",
            itemType: "BUFF",
            stackSize: 3,
            requirements: {
                fighting: 0,
                ranged: 0,
                magic: 0,
                tech: 0,
                firearms: 0
            },
            dropAmt: 1,
            buffCastTime: 1,
            tickDuration: -1, //instant
            buffVitalsModified: {},
            buffStatsModififed: {}
        },
        dropAmt: 3,
    }
]

main();
async function main() {
    // Upload to the Database
}