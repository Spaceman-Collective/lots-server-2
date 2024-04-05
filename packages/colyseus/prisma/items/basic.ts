import { PrismaClient, ItemLibrary } from '@prisma/client';
const prisma = new PrismaClient();

const wornItems: ItemLibrary[] = [
    {
        id: "armor_black",
        name: "Black Armor",
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
            wornStatsModfied: {
                damageMin: 0,
                damageMax: 0,
                accuracy: 0,
                dodge: 0,
                range: 0,
                speed: 0,
                critChance: 0,
                critMultiplier: 0,
                damageType: "NA",
                weaponType: "NA",
                ammoTypeRequired: "NA",
                ammoInventoryIdx: -2
            }
        },
        dropAmt: 1
    }
]

const buffItems: ItemLibrary[] = [
    {
        id: "health_potion",
        name: "Health Potion",
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
            buffCastTime: 1,
            tickDuration: -1, //instant
            buffVitalsModified: {
                health: 100,
                healthMax: 0,
                healthRecovery: 0,
                shields: 0,
                shieldsMax: 0,
                shieldsRecovery: 0,
                armor: 0,
                armorMax: 0,
                armorRecovery: 0,
            },
            buffStatsModififed: {
                damageMin: 0,
                damageMax: 0,
                accuracy: 0,
                dodge: 0,
                range: 0,
                speed: 0,
                critChance: 0,
                critMultiplier: 0,
                damageType: "NA",
                weaponType: "NA",
                ammoTypeRequired: "NA",
                ammoInventoryIdx: -2
            }
        },
        dropAmt: 3,
    }
]

const ammoItems: ItemLibrary[] = [
    {
        id: "arrow",
        name: "Arrow",
        type: "ammo",
        img: "Arrow.png",
        model: "Arrow.fbx",
        animation: "not_animated",
        data: {
            guid: "arrow",
            itemType: "AMMO",
            stackSize: 24,
            requirements: {
                fighting: 0,
                ranged: 0,
                magic: 0,
                tech: 0,
                firearms: 0
            },
            ammoType: "Arrows",
            ammoStatsModified: {
                damageMin: 0,
                damageMax: 0,
                accuracy: 0,
                dodge: 0,
                range: 0,
                speed: 0,
                critChance: 0,
                critMultiplier: 0,
                damageType: "NA",
                weaponType: "NA",
                ammoTypeRequired: "NA",
                ammoInventoryIdx: -2
            }
        },
        dropAmt: 24,
    }
]

const castableItems: ItemLibrary[] = [{
    id: "hex_bag",
    name: "Hex Bag",
    type: "castable",
    img: "Pouch.png",
    model: "Pouch.fbx",
    animation: "not_animated",
    data: {
        guid: "hex_bag",
        itemType: "CASTABLE",
        stackSize: 2,
        requirements: {
            fighting: 0,
            ranged: 0,
            magic: 0,
            tech: 0,
            firearms: 0
        },
        castableCastTime: 1,
        tileRange: 3,
        castableDuration: -1,
        castableStats: {
            damageMin: 0,
            damageMax: 0,
            accuracy: 0,
            dodge: 0,
            range: 0,
            speed: 0,
            critChance: 0,
            critMultiplier: 0,
            damageType: "NA",
            weaponType: "NA",
            ammoTypeRequired: "NA",
            ammoInventoryIdx: -2
        },
        castableVitals: {
            health: 0,
            healthMax: 0,
            healthRecovery: 0,
            shields: 0,
            shieldsMax: 0,
            shieldsRecovery: 0,
            armor: 0,
            armorMax: 0,
            armorRecovery: 0,
        },
        castableDamageStats: {
            damageMin: 0,
            damageMax: 0,
            accuracy: 0,
            dodge: 0,
            range: 0,
            speed: 0,
            critChance: 0,
            critMultiplier: 0,
            damageType: "NA",
            weaponType: "NA",
            ammoTypeRequired: "NA",
            ammoInventoryIdx: -2
        }
    },
    dropAmt: 2,
}]

main();
async function main() {
    // Upload to the Database
}