
export const character = {
    vitals: {
        health: 100,
        healthMax: 100,
        healthRecovery: 1,
        shields: 10,
        shieldsMax: 10,
        shieldsRecovery: 10,
        armor: 10,
        armorMax: 10,
        armorRecovery: 0,
        barrier: 10,
        barrierMax: 10,
        barrierRecovery: 1,
        stamina: 100,
        staminaMax: 100,
        staminaRecovery: 10,
    },
    stats: {
        damageMin: 1,
        damageMax: 100,
        dodge: 0,
        accuracy: 10000, // out of 10k
        range: 100,
        speed: 2, //attacks per 10 ticks
        critChance: 10, // out of 10k,
        critMultiplier: 2,
        damageType: "PHYS",
        weaponType: "FIGHTING"
    },
    skills: {
        fighting: 1,
        ranged: 1,
        magic: 1,
        firearms: 1,
        tech: 1
    }
}