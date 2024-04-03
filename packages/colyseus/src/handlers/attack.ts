import { Client } from "colyseus";
import { BattleArenaRoomStateSchema } from "../schema/rooms/BattleArenaRoom";
import { z } from 'zod';
import { plainToInstance } from "class-transformer";
import { ActionSchema } from "../schema/Action";

const AttackMsg = z.object({
    targetUsername: z.string()
});
export async function attack(state: BattleArenaRoomStateSchema, client: Client, msg: any, reqId: string) {
    try {
        const { targetUsername } = AttackMsg.parse(msg);
        // Validate the attack
        // Check if target player in game
        const user = state.users.get(client.id);
        const targetUser = state.users.get(state.usernameToClientId.get(targetUsername));
        if (!targetUser) {
            throw new Error("Target user doesn't exist!")
        }

        // Check if target player is ALIVE
        if (!targetUser.actor.isAlive) {
            throw new Error("Character already dead!");
        }

        // Check if the player is in range
        const distance = Math.sqrt(
            Math.pow(user.actor.x - targetUser.actor.x, 2) +
            Math.pow(user.actor.y - targetUser.actor.y, 2)
        );
        if (distance > user.actor.stats.range) {
            throw new Error("Target out of range!");
        }

        // Create new tickQ action based on user's weapon's speed
        const attackTick = state.ticks + (10 / user.actor.stats.speed);
        state.addToTickQ(attackTick, plainToInstance(ActionSchema, {
            actionType: "ATTACK",
            reqId,
            clientId: client.id,
            payload: JSON.stringify(msg),
            tickStartedAt: state.ticks.toString(),
            tickEndsAt: attackTick.toString()
        }))
    } catch (e: any) {
        throw e;
    }
}

export async function resolveAttack(state: BattleArenaRoomStateSchema, action: ActionSchema) {
    try {
        const { targetUsername } = AttackMsg.parse(JSON.parse(action.payload));

        // Apply the attack to the user
        const user = state.users.get(action.clientId);
        const targetUser = state.users.get(state.usernameToClientId.get(targetUsername));
        if (!targetUser) {
            throw new Error("Target user doesn't exist!")
        }

        // Player was in range when the attack was issued, so even if they move the attack will carry through
        // We don't need to look up items, just do offensive stats vs vitals

        // Handle Ammo Items
        if (user.actor.stats.ammoTypeRequired != "") {
            if (user.actor.stats.ammoInventoryIdx == -1) {
                throw new Error(`This weapon requires ammo type: ${user.actor.stats.ammoTypeRequired}`);
            }
            user.actor.inventory.items[user.actor.stats.ammoInventoryIdx].amount -= 1;
            if (user.actor.inventory.items[user.actor.stats.ammoInventoryIdx].amount == 0) {
                // delete the ammo item
                user.actor.inventory.items[user.actor.stats.ammoInventoryIdx] = null;
                // set inventoryIdx = -1
                user.actor.stats.ammoInventoryIdx = -1;
            }
        }

        // Does the attack land? 
        // Roll a number between (1,10k), if under the accuracy number, then it's a hit!
        // Add 250*skill to the roll, means at max level (10), you have 25% hit chance even if you roll a 0
        const skillAtkBonus = 250;
        // Subtract enemy dodge chance
        let atkRoll = Math.floor(Math.random() * 10001);
        switch (user.actor.stats.weaponType) {
            case "FIGHTING":
                atkRoll += user.actor.skills.fighting * skillAtkBonus;
                break;
            case "RANGED":
                atkRoll += user.actor.skills.ranged * skillAtkBonus;
                break;
            case "MAGIC":
                atkRoll += user.actor.skills.magic * skillAtkBonus;
                break;
            case "FIREARMS":
                atkRoll += user.actor.skills.firearms * skillAtkBonus;
                break;
            case "TECH":
                atkRoll += user.actor.skills.tech * skillAtkBonus;
                break;
        }
        atkRoll -= targetUser.actor.stats.dodge;
        if (atkRoll > user.actor.stats.accuracy) {
            throw new Error("Attack didn't land");
        }
        console.log(`${user.username} landed a ${atkRoll} attack roll on ${targetUser.username}`);

        // How much damage does the attack do?
        // Did it land a crit?
        // How much additional damage do you do because of your skills?
        // Roll between damageMin and damageMax and check crit
        // Add 10*skill for damage 
        const skillDmgBonus = 10;
        let dmgRoll = Math.floor(Math.random() * (user.actor.stats.damageMax - user.actor.stats.damageMin + 1)) + user.actor.stats.damageMin;
        const critRoll = Math.floor(Math.random() * 10001);
        if (critRoll < user.actor.stats.critChance) {
            dmgRoll *= user.actor.stats.critMultiplier / 100; // this is so we can store the critMultiplier as int
        }
        switch (user.actor.stats.weaponType) {
            case "FIGHTING":
                dmgRoll += user.actor.skills.fighting * skillDmgBonus;
                break;
            case "RANGED":
                dmgRoll += user.actor.skills.ranged * skillDmgBonus;
                break;
            case "MAGIC":
                dmgRoll += user.actor.skills.magic * skillDmgBonus;
                break;
            case "FIREARMS":
                dmgRoll += user.actor.skills.firearms * skillDmgBonus;
                break;
            case "TECH":
                dmgRoll += user.actor.skills.tech * skillDmgBonus;
                break;
        }
        if (dmgRoll < 0) {
            throw new Error("Damage less than 0, something went wrong!");
        }
        console.log(`${user.username} landed a ${dmgRoll} damage roll on ${targetUser.username}`);

        // Which pools of health does the target user lose?
        let healthDmg = dmgRoll;
        switch (user.actor.stats.damageType) {
            case "MAGIC":
                if (targetUser.actor.vitals.barrier > 0) {
                    let barrierDmg = targetUser.actor.vitals.barrier - dmgRoll;
                    if (barrierDmg < 0) {
                        healthDmg = Math.abs(barrierDmg);
                        targetUser.actor.vitals.barrier -= targetUser.actor.vitals.barrier; //sets barrier to 0
                    }
                }
                break;
            case "PHYS":
                if (targetUser.actor.vitals.armor > 0) {
                    let armorDmg = targetUser.actor.vitals.armor - dmgRoll;
                    if (armorDmg < 0) {
                        healthDmg = Math.abs(armorDmg);
                        targetUser.actor.vitals.armor -= targetUser.actor.vitals.armor; //sets armor to 0
                    }
                }
                break;
            case "TECH":
                if (targetUser.actor.vitals.shields > 0) {
                    let shieldsDmg = targetUser.actor.vitals.shields - dmgRoll;
                    if (shieldsDmg < 0) {
                        healthDmg = Math.abs(shieldsDmg);
                        targetUser.actor.vitals.shields -= targetUser.actor.vitals.shields; //sets shields to 0
                    }
                }
                break;
        }
        console.log("Health DMG: ", healthDmg);
        if (healthDmg >= targetUser.actor.vitals.health) {
            // Target User is DEAD
            targetUser.actor.vitals.health = 0;
            console.log(`${targetUser.username} died`)
            await state.processCharacterDeath(targetUser.username);
        } else {
            targetUser.actor.vitals.health -= healthDmg;
        }

    } catch (e: any) {
        throw e;
    }
}