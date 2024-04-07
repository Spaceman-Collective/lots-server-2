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
    },
    {
        id: "gun",
        name: "Gun",
        type: "worn",
        img: "Gun.png",
        model: "Gun.fbx",
        animation: "not_animated",
        data: {
            guid: "gun",
            itemType: "WORN",
            stackSize: 1,
            requirements: {
                fighting: 0,
                ranged: 0,
                magic: 0,
                tech: 0,
                firearms: 0
            },
            wornArea: "mainhand",
            wornVitalsModified: {
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
            wornStatsModfied: {
                damageMin: 10,
                damageMax: 50,
                accuracy: 2500,
                dodge: 0,
                range: 8,
                speed: 4,
                critChance: 1000,
                critMultiplier: 2,
                damageType: "PHYS",
                weaponType: "FIREARMS",
                ammoTypeRequired: "NA",
                ammoInventoryIdx: -2
            }
        },
        dropAmt: 1
    },
    {
        id: "book",
        name: "Book",
        type: "worn",
        img: "Book.png",
        model: "Book.fbx",
        animation: "not_animated",
        data: {
            guid: "book",
            itemType: "WORN",
            stackSize: 1,
            requirements: {
                fighting: 0,
                ranged: 0,
                magic: 0,
                tech: 0,
                firearms: 0
            },
            wornArea: "mainhand",
            wornVitalsModified: {
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
            wornStatsModfied: {
                damageMin: 10,
                damageMax: 50,
                accuracy: 2500,
                dodge: 0,
                range: 8,
                speed: 4,
                critChance: 1000,
                critMultiplier: 2,
                damageType: "MAGIC",
                weaponType: "MAGIC",
                ammoTypeRequired: "NA",
                ammoInventoryIdx: -2
            }
        },
        dropAmt: 1
    },
    {
        id: "sword",
        name: "Sword",
        type: "worn",
        img: "Sword.png",
        model: "Sword.fbx",
        animation: "not_animated",
        data: {
            guid: "sword",
            itemType: "WORN",
            stackSize: 1,
            requirements: {
                fighting: 0,
                ranged: 0,
                magic: 0,
                tech: 0,
                firearms: 0
            },
            wornArea: "mainhand",
            wornVitalsModified: {
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
            wornStatsModfied: {
                damageMin: 10,
                damageMax: 50,
                accuracy: 2500,
                dodge: 0,
                range: 8,
                speed: 4,
                critChance: 1000,
                critMultiplier: 2,
                damageType: "PHYS",
                weaponType: "FIGHTING",
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
            damageMin: 50,
            damageMax: 500,
            accuracy: 0,
            dodge: 0,
            range: 0,
            speed: 0,
            critChance: 1000,
            critMultiplier: 2,
            damageType: "PHYS",
            weaponType: "FIREARMS",
            ammoTypeRequired: "NA",
            ammoInventoryIdx: -2
        }
    },
    dropAmt: 2,
}]

main();
async function main() {
    try {
        // Upload to the Database
        await prisma.itemLibrary.createMany({
            //@ts-ignore
            data: [...wornItems, ...buffItems, ...ammoItems, ...castableItems]
        })
        console.log("Uploaded a items to the database!");
    } catch (e) {
        console.error(e);
    }
}