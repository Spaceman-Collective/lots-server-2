import { Client } from "colyseus";
import { BattleArenaRoomStateSchema } from "../schema/rooms/BattleArenaRoom";
import { z } from 'zod';
import { plainToInstance } from "class-transformer";
import { PrismaClient } from "@prisma/client";
import { ItemSchema, WornItemSchema } from "../schema/Item";
import { ActorSchema } from "../schema/Actor";
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

                //check 

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

        }
        // Check Requirements 
        // Apply buffs
    } catch (e: any) {
        throw e;
    }
}

export async function processDequip() { }