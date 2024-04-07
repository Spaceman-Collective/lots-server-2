import { CharacterRarity, UserCharacters } from "@prisma/client";
import { nanoid } from "nanoid";
import { uniqueNamesGenerator, names } from "unique-names-generator";

export function getRandomCharacter(roll: number): UserCharacters {
    const randomChar = rollCharacter(roll);
    return {
        id: nanoid(),
        name: uniqueNamesGenerator({ dictionaries: [names] }),

        username: "",
        selected: false,

        vitals: randomChar.vitals,
        stats: randomChar.stats,
        skills: randomChar.skills,

        rarity: randomChar.rarity
    }
}


// roll = 0 - 100
function rollCharacter(roll: number) {
    let mult;
    let rarity;
    if (roll < 50) {
        // 0 - 49 is common
        //(1x)
        mult = 1;
        rarity = CharacterRarity.COMMON;
    } else if (roll < 76) {
        // 76 - 90 is rare
        //(1.1 - 1.3x)
        mult = Math.random() * (0.2) + 1.1
        rarity = CharacterRarity.UNCOMMON;
    } else if (roll < 90) {
        // 76 - 90 is rare
        //(1.3-1.6x)
        mult = Math.random() * (0.3) + 1.3
        rarity = CharacterRarity.RARE;
    } else if (roll < 98) {
        // 91 - 98 is legendary
        //(1.6-1.9x)
        mult = Math.random() * (0.3) + 1.6
        rarity = CharacterRarity.LEGENDARY;
    } else if (roll < 100) {
        // 99 is deity
        //(2x)
        mult = 2;
        rarity = CharacterRarity.DEITY;
    }

    return {
        vitals: {
            health: Math.floor(CommonVitals.health * mult),
            healthMax: Math.floor(CommonVitals.healthMax * mult),
            healthRecovery: Math.floor(CommonVitals.healthRecovery * mult),

            shields: Math.floor(CommonVitals.shields),
            shieldsMax: Math.floor(CommonVitals.shieldsMax * mult),
            shieldsRecovery: Math.floor(CommonVitals.shieldsRecovery * mult),

            armor: Math.floor(CommonVitals.armor * mult),
            armorMax: Math.floor(CommonVitals.armorMax * mult),
            armorRecovery: Math.floor(CommonVitals.armorRecovery * mult),

            barrier: Math.floor(CommonVitals.barrier * mult),
            barrierMax: Math.floor(CommonVitals.barrierMax * mult),
            barrierRecovery: Math.floor(CommonVitals.barrierRecovery * mult),

            stamina: Math.floor(CommonVitals.stamina * mult),
            staminaMax: Math.floor(CommonVitals.staminaMax * mult),
            staminaRecovery: Math.floor(CommonVitals.staminaRecovery * mult),
        },
        skills: rarity == CharacterRarity.DEITY ? {
            fighting: 2,
            ranged: 2,
            magic: 2,
            tech: 2,
            firearms: 2
        } : CommonSkills,
        stats: {
            damageMin: Math.floor(CommonStats.damageMin * mult),
            damageMax: Math.floor(CommonStats.damageMax * mult),
            accuracy: Math.floor(CommonStats.accuracy * mult),
            dodge: Math.floor(CommonStats.dodge * mult),
            range: 1, //even deity characters shouldn't have range 2
            speed: Math.floor(CommonStats.speed * mult),
            critChance: Math.floor(CommonStats.critChance * mult),
            critMultiplier: Math.floor(CommonStats.critMultiplier * mult),
            damageType: "PHYS",
            weaponType: "FIGHTING", //fists
            ammoTypeRequired: "",
            ammoInventoryIdx: -1
        },
        rarity,
    }

}

export const CommonVitals = {
    health: 1000,
    healthMax: 1000,
    healthRecovery: 1,

    shields: 0,
    shieldsMax: 0,
    shieldsRecovery: 0,

    armor: 0,
    armorMax: 0,
    armorRecovery: 0,

    barrier: 0,
    barrierMax: 0,
    barrierRecovery: 0,

    stamina: 100,
    staminaMax: 100, //100 tiles runnable
    staminaRecovery: 5,
}
export const CommonStats = {
    damageMin: 10,
    damageMax: 15,
    accuracy: 10000, //10% accuracy //TODO: set back to 25%
    dodge: 10,
    range: 1,
    speed: 1,
    critChance: 100, // 1% crit chance
    critMultiplier: 110, // 1.1x multiplier
    damageType: "PHYS",
    weaponType: "FIGHTING", //fists
    ammoTypeRequired: "",
    ammoInventoryIdx: -1
}
export const CommonSkills = {
    fighting: 1,
    ranged: 1,
    magic: 1,
    firearms: 1,
    tech: 1
}