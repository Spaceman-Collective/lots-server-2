import { Request, Response } from "express";
import { isAborted, z } from "zod";
import { PrismaClient } from '@prisma/client';
import { jwtVerify } from "jose";
import { ItemSchema, WornItemSchema } from "../schema/Item";
import { plainToInstance } from "class-transformer";
import { checkRequirements, processEquip } from "../handlers/item";
import { ActorSchema, SkillsSchema } from "../schema/Actor";
const prisma = new PrismaClient();

const InventoryMsg = z.object({
    jwt: z.string(),
    from: z.enum(["VAULT", "BACKPACK", "WORN"]),
    to: z.enum(["VAULT", "BACKPACK", "WORN"]),
    fromIdx: z.number().optional(), //for VAULT/BACKPACK
    toIdx: z.number().optional(),
    fromSlot: z.enum(["head", "torso", "legs", "boots", "mainhand", "offhand"]).optional(),
    toSlot: z.enum(["head", "torso", "legs", "boots", "mainhand", "offhand"]).optional(),
});


export async function inventory(req: Request, res: Response) {
    try {
        const msg = InventoryMsg.parse(req.body);

        const { payload } = await jwtVerify(
            msg.jwt,
            new TextEncoder().encode(process.env.SERVER_JWT_KEY)
        );
        const username = payload.username as string;
        const selectedCharacter = await prisma.userCharacters.findFirst({
            where: { username, selected: true }
        });

        if (!selectedCharacter) { throw new Error("Please select a character first!") }


        const userEquipment = await prisma.userEquipment.findUniqueOrThrow({ where: { username } });
        let worn = userEquipment.worn as any as Worn;
        let backpack = (userEquipment.inventory as any)['items'] as HeldItem[];
        let vault = userEquipment.vault as any as HeldItem[];

        const EmptyItem: HeldItem = {
            amount: 0,
            itemId: "",
        }

        let fromItemAmt: HeldItem;
        if (msg.from == "VAULT") {
            fromItemAmt = vault.length > msg.fromIdx ? vault[msg.fromIdx] : EmptyItem;
        } else if (msg.from == "BACKPACK") {
            fromItemAmt = backpack.length > msg.fromIdx ? backpack[msg.fromIdx] : EmptyItem;
        } else if (msg.from == "WORN") {
            fromItemAmt = {
                amount: worn[msg.fromSlot] ? 1 : 0,
                itemId: worn[msg.fromSlot]
            }
        }

        let toItemAmt: HeldItem;
        if (msg.to == "VAULT") {
            toItemAmt = vault.length > msg.toIdx ? vault[msg.toIdx] : EmptyItem;
        } else if (msg.to == "BACKPACK") {
            toItemAmt = backpack.length > msg.toIdx ? backpack[msg.toIdx] : EmptyItem;
        } else if (msg.to == "WORN") {
            toItemAmt = {
                amount: worn[msg.toSlot] ? 1 : 0,
                itemId: worn[msg.toSlot]
            }
        }

        if (toItemAmt.itemId == "") {
            // toItemAmt.itemId being "" means the spot being moved to is empty

            // place from item to to item 
            toItemAmt.itemId = fromItemAmt.itemId;
            toItemAmt.amount = fromItemAmt.amount;
            fromItemAmt.itemId = "";
            fromItemAmt.amount = 0;
            // delete from item
            if (msg.from == "VAULT") {
                vault.splice(msg.fromIdx, 1);
            } else if (msg.from == "BACKPACK") {
                backpack.splice(msg.fromIdx, 1);
            } else if (msg.from == "WORN") {
                worn[msg.fromSlot] = "";
            }

            // set to item
            if (msg.to == "VAULT") {
                vault[msg.toIdx] = fromItemAmt;
            } else if (msg.to == "BACKPACK") {
                backpack[msg.toIdx] = fromItemAmt;
            } else if (msg.to == "WORN") {
                const item = await prisma.itemLibrary.findUniqueOrThrow({ where: { id: fromItemAmt.itemId } })
                const bareItem = plainToInstance(ItemSchema, item.data);
                // check requirements, check slot, check its a worn item
                if (bareItem.itemType != "WORN") {
                    throw new Error("This item cannot be worn!")
                }

                if (!checkRequirements(bareItem.requirements, plainToInstance(SkillsSchema, selectedCharacter.skills))) {
                    throw new Error("Selected character cannot equip this item!");
                }

                const wornItem = plainToInstance(WornItemSchema, item.data);
                if (msg.toSlot != wornItem.wornArea) {
                    throw new Error(`This item is meant to be worn in the ${wornItem.wornArea} slot.`)
                }
                worn[msg.toSlot] = fromItemAmt.itemId;
                //process equip will be done for all items at the end when we send new selected character back
            }

        } else {
            //spot being moved to is not empty
            //check if same item, then stack code
            if (fromItemAmt.itemId == toItemAmt.itemId && msg.to != "WORN") {
                // only time we have to actually fetch the item to figure out it's stackSize
                const item = await prisma.itemLibrary.findUniqueOrThrow({ where: { id: fromItemAmt.itemId } });
                const itemData = plainToInstance(ItemSchema, item.data);
                if (toItemAmt.amount >= itemData.stackSize) {
                    throw new Error("Trying to move onto an already full stack;")
                } else {
                    const amtToMove = fromItemAmt.amount - toItemAmt.amount;
                    fromItemAmt.amount -= amtToMove;
                    toItemAmt.amount += amtToMove;

                    // set the new from and to
                    if (msg.from == "VAULT") {
                        vault[msg.fromIdx].amount = fromItemAmt.amount;
                    } else if (msg.from == "BACKPACK") {
                        backpack[msg.fromIdx].amount = fromItemAmt.amount;
                    } else if (msg.from == "WORN") {
                        // stack sizes should work for worn items
                        // should've already thrown an error
                    }

                    if (msg.to == "VAULT") {
                        vault[msg.toIdx].amount = toItemAmt.amount;
                    } else if (msg.to == "BACKPACK") {
                        backpack[msg.toIdx].amount = toItemAmt.amount;
                    } else if (msg.to == "WORN") {
                        // stack sizes should work for worn items
                        // should've already thrown an error
                    }
                }

            } else {
                if (msg.from == "WORN" && msg.to == "WORN" && fromItemAmt.itemId == toItemAmt.itemId) {
                    //same item being moved to the same slot in worn
                    //do nothing
                } else {
                    //if different item, then swap

                    //set to item to fromItem
                    if (msg.to == "VAULT") {
                        vault[msg.toIdx] = fromItemAmt
                    } else if (msg.to == "BACKPACK") {
                        backpack[msg.toIdx] = fromItemAmt;
                    } else if (msg.to == "WORN") {
                        // check requirements, check slot, check its a worn item
                        const item = await prisma.itemLibrary.findUniqueOrThrow({ where: { id: fromItemAmt.itemId } })
                        const bareItem = plainToInstance(ItemSchema, item.data);
                        // check requirements, check slot, check its a worn item
                        if (bareItem.itemType != "WORN") {
                            throw new Error("This item cannot be worn!")
                        }

                        if (!checkRequirements(bareItem.requirements, plainToInstance(SkillsSchema, selectedCharacter.skills))) {
                            throw new Error("Selected character cannot equip this item!");
                        }

                        const wornItem = plainToInstance(WornItemSchema, item.data);
                        if (msg.toSlot != wornItem.wornArea) {
                            throw new Error(`This item is meant to be worn in the ${wornItem.wornArea} slot.`)
                        }

                        worn[msg.toSlot] = fromItemAmt.itemId;
                    }

                    //set from item to toItem
                    if (msg.from == "VAULT") {
                        vault[msg.fromIdx] = toItemAmt
                    } else if (msg.from == "BACKPACK") {
                        backpack[msg.fromIdx] = toItemAmt;
                    } else if (msg.from == "WORN") {
                        //process dequip doesn't matter, cause we'll process a fresh equip of all equipped items
                        worn[msg.fromSlot] = toItemAmt.itemId;
                    }

                }
            }
        }

        // TODO fill empty slots with empty items
        backpack = backpack.filter((x) => x != undefined);
        vault = vault.filter((x) => x != undefined);

        //update user equipment
        const newUserEquipment = await prisma.userEquipment.update({
            where: { username },
            data: {
                worn: worn as any,
                inventory: { items: backpack as any },
                vault: vault as any
            }
        })

        const selectedActor = plainToInstance(ActorSchema, {
            vitals: selectedCharacter.vitals,
            stats: selectedCharacter.stats,
            skills: selectedCharacter.skills,
            inventory: { items: backpack as any },
            worn: worn,
            isAlive: true
        })

        await selectedActor.processEquipment()

        res.status(200).json({ success: true, inventory: newUserEquipment, selectedActor: selectedActor.toJSON() });
    } catch (e: any) {
        console.log(e.message);
        res.status(500).json({ success: false, error: e.message });
    }
}

interface Worn {
    head: string,
    torso: string,
    legs: string,
    boots: string,
    mainhand: string,
    offhand: string
}

interface HeldItem {
    itemId: string,
    amount: number
}