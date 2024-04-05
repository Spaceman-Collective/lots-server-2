import { Client } from "colyseus";
import { BattleArenaRoomStateSchema } from "../schema/rooms/BattleArenaRoom";
import { z } from 'zod';
import { plainToInstance } from "class-transformer";
import { PrismaClient } from "@prisma/client";
import { AmmoItemSchema, BuffItemSchema, CastableItemSchema, ItemSchema, WornItemSchema } from "../schema/Item";
import { ActorSchema, InventorySchema, SkillsSchema, StatsSchema, VitalsSchema } from "../schema/Actor";
import { ActionSchema } from "../schema/Action";
import { processAttack } from "./attack";
const prisma = new PrismaClient();

/**
 * Takes in an item in inventory and deletes it, causing it's effect
 * Items can target SELF or another ACTOR
 * Effects last for X duration, and are reverted after that time
 */
const ConsumeMsg = z.object({
    inventoryIdx: z.number(),
    targetTile: z.object({
        x: z.number(),
        y: z.number(),
    }).optional(), //for castables
})

interface ItemServerPayload {
    effectType: "BUFF" | "CAST"
}

interface BuffServerPayload extends ItemServerPayload {
    targetUsername: string,
    vitalsModified: any | null,
    statsModified: any | null,
    skillsModified: any | null,
}

interface CastServerPayload extends ItemServerPayload {
    actorGUID: string,
    vitalsModified: any | null,
    statsModified: any | null,
    skillsModified: any | null,
    damageStats: any | null,
    casterSkills: any | null,
}

export async function item(state: BattleArenaRoomStateSchema, client: Client, msg: any, reqId: string) {
    try {
        const { inventoryIdx, targetTile } = ConsumeMsg.parse(msg);

        // Fetch the item from the database
        let itemId = "";
        try {
            itemId = state.users.get(client.id).actor.inventory.items[inventoryIdx].itemId;
        } catch (e: any) {
            throw new Error("Item not found!")
        }

        const item = await prisma.itemLibrary.findUniqueOrThrow({
            where: { id: itemId }
        })

        const actor = state.users.get(client.sessionId).actor;

        // See what kind of item it is
        const itemData = plainToInstance(ItemSchema, item.data);

        // Check Requirements 
        if (!checkRequirements(itemData.requirements, actor.skills)) {
            throw new Error("Doesn't meet requirements!")
        }

        switch (itemData.itemType) {
            case "WORN":
                throw new Error("Can only equip items in Lobby")

                // If it's WORN, equip/dequip, no reason to add to TickQ
                const wornItem = plainToInstance(WornItemSchema, item.data);
                // process dequip of the old item
                if (actor.worn[wornItem.wornArea] != "") {
                    const currentlyWornItem = plainToInstance(WornItemSchema, (await prisma.itemLibrary.findUniqueOrThrow({
                        where: { id: actor.worn[wornItem.wornArea] }
                    })).data)
                    processDequip(actor, currentlyWornItem);
                }
                // swap worn item with inventory idx and set new item to slot
                actor.inventory.items[inventoryIdx].itemId = actor.worn[wornItem.wornArea];
                // no need to adjust stack size cause worn items are always stack size 1
                actor.worn[wornItem.wornArea] = item.id;
                // process equip of the new item
                processEquip(actor, wornItem);

                break;
            case "BUFF":
                // If it's BUFF, add 2 to tick Q, one after buffCastDuration to apply the effect, and then buffDuration after to inverse it
                const buffItem = plainToInstance(BuffItemSchema, item.data);
                const takesEffectTick = state.ticks + buffItem.buffCastTime;
                state.addToTickQ(
                    takesEffectTick,
                    plainToInstance(ActionSchema, {
                        actionType: "ITEM",
                        reqId,
                        clientId: client.sessionId,
                        payload: JSON.stringify(msg),
                        tickStartedAt: state.ticks.toString(),
                        tickEndsAt: takesEffectTick.toString(),
                        serverPayload: JSON.stringify({
                            effectType: "BUFF",
                            targetUsername: state.users.get(client.sessionId).username, //target self
                            statsModified: buffItem.buffStatsModified.toJSON(),
                            vitalsModified: buffItem.buffVitalsModified.toJSON(),
                            skillsModified: null,
                        } as BuffServerPayload)
                    })
                );

                //if duration is -1, then no need to reverse
                if (buffItem.tickDuration != -1) {
                    const expiresTick = takesEffectTick + buffItem.tickDuration;
                    state.addToTickQ(
                        takesEffectTick,
                        plainToInstance(ActionSchema, {
                            actionType: "ITEM",
                            reqId,
                            clientId: client.sessionId,
                            payload: JSON.stringify(msg),
                            tickStartedAt: takesEffectTick.toString(),
                            tickEndsAt: expiresTick.toString(),
                            serverPayload: JSON.stringify({
                                effectType: "BUFF",
                                targetUsername: state.users.get(client.sessionId).username,
                                statsModified: (inverseStats(buffItem.buffStatsModified)).toJSON(),
                                vitalsModified: (inverseVitals(buffItem.buffVitalsModified)).toJSON(),
                                skillsModified: null,
                            } as BuffServerPayload)
                        })
                    );
                }
                break;
            case "AMMO":
                // If it's Ammo, check if it's the type required, and then set the ammoInventoryIdx to this item
                const ammoItem = plainToInstance(AmmoItemSchema, item.data);
                if (actor.stats.ammoTypeRequired != ammoItem.ammoType) {
                    throw new Error("Incorrect ammo type for selected weapon.")
                }
                actor.stats.ammoInventoryIdx = inventoryIdx;
                break;
            case "CASTABLE":
                // If it's castable, check range, target, etc, then wait cast duration and apply two tickQ events
                if (!targetTile) { throw new Error("Target tile required for castables!") }
                const castableItem = plainToInstance(CastableItemSchema, item.data);
                const actorsInRange = findCharactersInTileRange(state, { x: targetTile.x, y: targetTile.y }, castableItem.tileRange);
                const castTakesEffectTick = state.ticks + castableItem.castableCastTime;
                for (let actor of actorsInRange) {
                    state.addToTickQ(
                        castTakesEffectTick,
                        plainToInstance(ActionSchema, {
                            actionType: "ITEM",
                            reqId,
                            clientId: client.sessionId,
                            payload: JSON.stringify(msg),
                            tickStartedAt: state.ticks.toString(),
                            tickEndsAt: castTakesEffectTick.toString(),
                            serverPayload: JSON.stringify({
                                effectType: "CAST",
                                actorGUID: actor.guid,
                                statsModified: castableItem.castableStats.toJSON(),
                                vitalsModified: castableItem.castableVitals.toJSON(),
                                skillsModified: null,
                                damageStats: castableItem.castableDamageStats.toJSON(),
                                casterSkills: actor.skills.toJSON()
                            })
                        })
                    )

                    if (castableItem.castDuration != -1) {
                        const expiresTick = castTakesEffectTick + castableItem.castDuration;
                        state.addToTickQ(
                            expiresTick,
                            plainToInstance(ActionSchema, {
                                actionType: "ITEM",
                                reqId,
                                clientId: client.sessionId,
                                payload: JSON.stringify(msg),
                                tickStartedAt: state.ticks.toString(),
                                tickEndsAt: expiresTick.toString(),
                                serverPayload: JSON.stringify({
                                    effectType: "CAST",
                                    actorGUID: actor.guid,
                                    statsModified: (inverseStats(castableItem.castableStats)).toJSON(),
                                    vitalsModified: (inverseVitals(castableItem.castableVitals)).toJSON(),
                                    skillsModified: null,
                                    damageStats: null, //not needed to reverse if its damage
                                    casterSkills: null, //only needed on damage and not needed on reverse
                                })
                            })
                        )
                    }
                }
                break;
        }

    } catch (e) {
        throw e;
    }
}

function findCharactersInTileRange(state: BattleArenaRoomStateSchema, targetTile: { x: number, y: number }, range: number): ActorSchema[] {
    let actorsInRange: ActorSchema[] = [];
    // TODO: in the future we may have non user actors in a space
    for (let user of state.users.entries()) {
        const distance = Math.sqrt(
            Math.pow(targetTile.x - user[1].actor.x, 2) +
            Math.pow(targetTile.y - user[1].actor.y, 2)
        );
        if (distance < range) {
            actorsInRange.push(user[1].actor);
        }
    }
    return actorsInRange;
}

export async function resolveItem(state: BattleArenaRoomStateSchema, action: ActionSchema) {
    try {
        const serverPayload = JSON.parse(action.serverPayload) as ItemServerPayload;
        if (serverPayload.effectType == "BUFF") {
            const buffPayload = serverPayload as BuffServerPayload;
            const targetActor = state.users.get(state.usernameToClientId.get(buffPayload.targetUsername)).actor;
            if (buffPayload.skillsModified) {
                modifySkills(targetActor.skills, plainToInstance(SkillsSchema, buffPayload.skillsModified))
            }

            if (buffPayload.statsModified) {
                modifyStats(targetActor.stats, plainToInstance(StatsSchema, buffPayload.statsModified))
            }

            if (buffPayload.vitalsModified) {
                modifyVitals(targetActor.vitals, plainToInstance(VitalsSchema, buffPayload.vitalsModified))
            }
        } else if (serverPayload.effectType == "CAST") {
            const castPayload = serverPayload as CastServerPayload;
            const getActorByGUID = (guid: string): ActorSchema => {
                for (let user of state.users.entries()) {
                    if (user[1].actor.guid == guid) {
                        return user[1].actor;
                    }
                }
            }
            const targetActor = getActorByGUID(castPayload.actorGUID);
            if (castPayload.skillsModified) {
                modifySkills(targetActor.skills, plainToInstance(SkillsSchema, castPayload.skillsModified))
            }

            if (castPayload.statsModified) {
                modifyStats(targetActor.stats, plainToInstance(StatsSchema, castPayload.statsModified))
            }

            if (castPayload.vitalsModified) {
                modifyVitals(targetActor.vitals, plainToInstance(VitalsSchema, castPayload.vitalsModified))
            }

            if (castPayload.damageStats) {
                // Attack with this weapon to the target actor
                await processAttack(
                    {
                        stats: plainToInstance(StatsSchema, castPayload.damageStats),
                        inventory: new InventorySchema(),
                        skills: plainToInstance(SkillsSchema, castPayload.casterSkills),
                    },
                    {
                        skills: targetActor.skills,
                        vitals: targetActor.vitals,
                        stats: targetActor.stats
                    }
                )



            }
        }
    } catch (e) {
        throw e;
    }
}

// Modifies character stats with WORN item stats
export function processEquip(actor: ActorSchema, item: WornItemSchema) {
    try {
        // Check that equip slot is empty
        if (actor.worn[item.wornArea] != "") {
            throw new Error("Must dequip first!")
        }
        // Apply buffs
        modifyVitals(actor.vitals, item.wornVitalsModified);
        modifyStats(actor.stats, item.wornStatsModified);
    } catch (e: any) {
        throw e;
    }
}

export function processDequip(actor: ActorSchema, item: WornItemSchema) {
    try {
        // apply inverse buffs from item
        modifyVitals(actor.vitals, inverseVitals(item.wornVitalsModified));
        modifyStats(actor.stats, inverseStats(item.wornStatsModified));
    } catch (e: any) {
        throw e;
    }
}

function checkRequirements(requirements: SkillsSchema, currentSkills: SkillsSchema): boolean {
    if (
        currentSkills.fighting < requirements.fighting ||
        currentSkills.ranged < requirements.ranged ||
        currentSkills.magic < requirements.magic ||
        currentSkills.firearms < requirements.firearms ||
        currentSkills.tech < requirements.tech
    ) {
        return false;
    } else {
        return true;
    }
}

export function modifyVitals(vitals: VitalsSchema, modifications: VitalsSchema) {
    vitals.health += modifications.health + modifications.healthMax; //if boost max, then also add to base pool
    vitals.healthMax += modifications.healthMax;
    vitals.healthRecovery += modifications.healthRecovery;

    vitals.shields += modifications.shields + modifications.shieldsMax;
    vitals.shieldsMax += modifications.shieldsMax;
    vitals.shieldsRecovery += modifications.shieldsMax;

    vitals.armor += modifications.armor + modifications.armorMax;
    vitals.armorMax += modifications.armorMax;
    vitals.armorRecovery += modifications.armorRecovery;

    vitals.barrier += modifications.barrier + modifications.barrierMax;
    vitals.barrierMax += modifications.barrierMax;
    vitals.barrierRecovery += modifications.barrierRecovery;

    vitals.stamina += modifications.stamina + modifications.staminaMax;
    vitals.staminaMax += modifications.staminaMax;
    vitals.staminaRecovery += modifications.staminaRecovery;
}

export function inverseVitals(vitals: VitalsSchema): VitalsSchema {
    const newVitals = vitals.clone();
    newVitals.health = vitals.health * -1;
    newVitals.healthMax = vitals.healthMax * -1;
    newVitals.healthRecovery = vitals.healthRecovery * -1;

    newVitals.shields = vitals.shields * -1;
    newVitals.shieldsMax = vitals.shieldsMax * -1;
    newVitals.shieldsRecovery = vitals.shieldsRecovery * -1;

    newVitals.barrier = vitals.barrier * -1;
    newVitals.barrierMax = vitals.barrierMax * -1;
    newVitals.barrierRecovery = vitals.barrierRecovery * -1;

    newVitals.armor = vitals.armor * -1;
    newVitals.armorMax = vitals.armor * -1;
    newVitals.armorRecovery = vitals.armorRecovery * -1;

    newVitals.stamina = vitals.stamina * -1;
    newVitals.staminaMax = vitals.staminaMax * -1;
    newVitals.staminaRecovery = vitals.staminaRecovery * -1;

    return newVitals;
}

export function modifySkills(skills: SkillsSchema, modifications: SkillsSchema) {
    skills.fighting += modifications.fighting;
    skills.ranged += modifications.ranged;
    skills.firearms += modifications.firearms;
    skills.magic += modifications.magic;
    skills.tech += modifications.tech;
}

export function inverseSkills(skills: SkillsSchema): SkillsSchema {
    const newSkills = skills.clone();
    newSkills.fighting = skills.fighting * -1;
    newSkills.ranged = skills.ranged * -1;
    newSkills.firearms = skills.firearms * -1;
    newSkills.magic = skills.magic * -1;
    newSkills.tech = skills.tech * -1;

    return newSkills;
}

export function modifyStats(stats: StatsSchema, modifications: StatsSchema) {
    stats.damageMin += modifications.damageMin;
    stats.damageMax += modifications.damageMax;
    stats.accuracy += modifications.accuracy;
    stats.dodge += modifications.dodge;
    stats.range += modifications.range;
    stats.speed += modifications.speed;
    stats.critChance += modifications.critChance;
    stats.critMultiplier += modifications.critMultiplier;

    if (modifications.damageType != "NA") {
        stats.damageType += modifications.damageType;
    }

    if (modifications.damageType != "NA") {
        stats.weaponType += modifications.weaponType;
    }

    if (modifications.damageType != "NA") {
        stats.ammoTypeRequired += modifications.ammoTypeRequired;
    }

    if (modifications.ammoInventoryIdx != -2) {
        stats.ammoInventoryIdx += modifications.ammoInventoryIdx;
    }
}

export function inverseStats(stats: StatsSchema): StatsSchema {
    const newStats = stats.clone();
    newStats.damageMin = stats.damageMin * -1;
    newStats.damageMax = stats.damageMax * -1;
    newStats.accuracy = stats.accuracy * -1;
    newStats.dodge = stats.dodge * -1;
    newStats.range = stats.range * -1;
    newStats.speed = stats.speed * -1;
    newStats.critChance = stats.critChance * -1;
    newStats.critMultiplier = stats.critMultiplier * -1;

    if (stats.damageType == "NA") {
        newStats.damageType = "NA"; // all damage type inverse is PHYS as default        
    } else {
        newStats.damageType = "PHYS"
    }

    if (stats.weaponType == "NA") {
        newStats.weaponType = "NA";
    } else {
        newStats.weaponType = "FIGHTING"; //default unarmed fighting
    }

    if (stats.ammoTypeRequired == "NA") {
        newStats.ammoTypeRequired = "NA"
    } else {
        newStats.ammoTypeRequired = "";
    }

    if (stats.ammoInventoryIdx = -2) {
        newStats.ammoInventoryIdx = -2;
    } else {
        newStats.ammoInventoryIdx = -1;
    }

    return newStats;
}
