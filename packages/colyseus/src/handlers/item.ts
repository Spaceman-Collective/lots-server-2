import { Client } from "colyseus";
import { BattleArenaRoomStateSchema } from "../schema/rooms/BattleArenaRoom";
import { z } from 'zod';
import { plainToInstance } from "class-transformer";
import { PrismaClient } from "@prisma/client";
import { ItemSchema, WornItemSchema } from "../schema/Item";
import { ActorSchema, SkillsSchema, VitalsSchema } from "../schema/Actor";
const prisma = new PrismaClient();

/**
 * Takes in an item in inventory and deletes it, causing it's effect
 * Items can target SELF or another ACTOR
 * Effects last for X duration, and are reverted after that time
 */
const ConsumeMsg = z.object({
    inventoryIdx: z.number(),
    targetUsername: z.string().optional(),
    targetTileIdx: z.number().optional(), //for castables
})
export async function item(state: BattleArenaRoomStateSchema, client: Client, msg: any, reqId: string) {
    try {
        const { inventoryIdx, targetUsername, targetTileIdx } = ConsumeMsg.parse(msg);

        // Fetch the item from the database
        let itemId = "";
        try {
            itemId = state.users.get(client.id).actor.inventory.items[inventoryIdx].itemId;
        } catch (e: any) {
            throw new Error("Item not found!")
        }


        const item = await prisma.itemLibrary.findUniqueOrThrow({
            where: {
                id: itemId
            }
        })

        // See what kind of item it is
        const itemData = plainToInstance(ItemSchema, item.data);
        switch (itemData.itemType) {
            case "WORN":
                // If it's WORN, equip/dequip, no reason to add to TickQ
                // process dequip of the old item
                // set new item to slot
                // process equip of the new item
                break;
            case "BUFF":
                // If it's BUFF, add 2 to tick Q, one after buffCastDuration to apply the effect, and then buffDuration after to inverse it
                break;
            case "AMMO":
                // If it's Ammo, check if it's the type required, and then set the ammoInventoryIdx to this item
                break;
            case "CASTABLE":
                // If it's castable, check range, target, etc, then wait cast duration and apply two tickQ events
                break;
        }

    } catch (e) {
        throw e;
    }
}

// Modifies character stats with WORN item stats
export async function processEquip(actor: ActorSchema, item: WornItemSchema) {
    try {
        // Check that equip slot is empty
        if (actor.worn[item.wornArea] != "") {
            throw new Error("Must dequip first!")
        }
        // Check Requirements 
        if (!checkRequirements(item.requirements, actor.skills)) {
            throw new Error("Doesn't meet requirements!")
        }
        // Apply buffs

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

export async function modifyVitals(vitals: VitalsSchema, modifications: VitalsSchema) {
    let keys = Object.keys(vitals.toJSON());
}

export async function processDequip() { }