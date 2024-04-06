import { Schema, MapSchema, Context } from "@colyseus/schema";
import { RoomOptionsSchema } from "./RoomOptions";
import { UserSchema } from "../User";
import { ActionArraySchema, ActionSchema } from "../Action";
import { BattleMap } from "../BattleMap";
import DefaultMap from '../../maps/default';
import { PrismaClient } from '@prisma/client';
import { InventorySchema, ItemObject } from "../Actor";
import { plainToInstance } from "class-transformer";
const prisma = new PrismaClient();

const type = Context.create();

export class BattleArenaRoomStateSchema extends Schema {
    @type("uint64") ticks: number;

    @type(RoomOptionsSchema) roomOptions: RoomOptionsSchema = new RoomOptionsSchema();
    @type(BattleMap) bmap = new BattleMap();

    // Client ID => User Object => Actor they control
    @type({ map: UserSchema }) users = new MapSchema<UserSchema>();
    @type({ map: "string" }) usernameToClientId = new MapSchema<string>();
    @type("boolean") inLobby: boolean;
    @type("string") winnerUsername: string = "";

    // Actor Queue System
    // Client Current Action (clientId => action)
    @type({ map: ActionSchema }) clientCurrentAction = new MapSchema<ActionSchema>();
    @type({ map: ActionSchema }) clientBufferedAction = new MapSchema<ActionSchema>();

    // Global Tick Q
    @type({ map: ActionArraySchema }) tickQ = new MapSchema<ActionArraySchema>();

    // Winning LootBox
    @type(InventorySchema) lootbox = new InventorySchema();

    constructor(
        ownerUserName: string,
        password: string,
        maxPlayers: number,
        map: string,
    ) {
        super();
        this.ticks = 0;
        this.roomOptions.ownerUserName = ownerUserName;
        this.roomOptions.password = password ? password : "";
        this.roomOptions.maxPlayers = maxPlayers ? maxPlayers : 5;
        this.roomOptions.mapName = map;
        this.inLobby = true;

        // TODO: Map logic implementation later for obstructions
        /* 
        switch (map) {
            case "DEFAULT":
                this.bmap = DefaultMap;
                break;
        }
        */
    }

    addToTickQ(
        actionEndTick: number, // tick when action ends
        action: ActionSchema
    ) {
        if (this.clientCurrentAction.has(action.clientId)) {
            throw new Error("Client already has pending move!")
        }

        if (this.tickQ.has(actionEndTick.toString())) {
            this.tickQ.get(actionEndTick.toString())
                .actions.push(action)
        } else {
            this.tickQ.set(actionEndTick.toString(), new ActionArraySchema([action]))
        }

        this.clientCurrentAction.set(action.clientId, action);
    }

    async processCharacterDeath(username: string) {
        // Set character to dead
        const targetActor = this.users.get(this.usernameToClientId.get(username)).actor
        targetActor.isAlive = false;
        // Reduce character amount from user characters
        const selectedCharacter = await prisma.userCharacters.findFirst({
            where: {
                username,
                selected: true
            }
        });
        await prisma.userCharacters.delete({
            where: {
                id: selectedCharacter.id
            }
        })

        // Dump character inventory in final loot box 
        // (each item has a 20% chance of ending up in the final lootbox)
        const itemDropChance = 20;

        // TODO also go through worn items
        for (let i = 0; i < targetActor.inventory.items.length; i++) {
            const dropRoll = Math.floor(Math.random() * 101);
            if (dropRoll < itemDropChance) {
                this.lootbox.items.push(targetActor.inventory.items[i]);
            }
            targetActor.inventory.items.deleteAt(i);
        }
        if (targetActor.worn.head != "") {
            const dropRoll = Math.floor(Math.random() * 101);
            if (dropRoll < itemDropChance) {
                this.lootbox.items.push(plainToInstance(ItemObject, { itemId: targetActor.worn.head, amount: 1 }));
            }
            targetActor.worn.head = "";
        }
        if (targetActor.worn.torso != "") {
            const dropRoll = Math.floor(Math.random() * 101);
            if (dropRoll < itemDropChance) {
                this.lootbox.items.push(plainToInstance(ItemObject, { itemId: targetActor.worn.torso, amount: 1 }));
            }
            targetActor.worn.torso = "";
        }
        if (targetActor.worn.legs != "") {
            const dropRoll = Math.floor(Math.random() * 101);
            if (dropRoll < itemDropChance) {
                this.lootbox.items.push(plainToInstance(ItemObject, { itemId: targetActor.worn.legs, amount: 1 }));
            }
            targetActor.worn.legs = "";
        }
        if (targetActor.worn.boots != "") {
            const dropRoll = Math.floor(Math.random() * 101);
            if (dropRoll < itemDropChance) {
                this.lootbox.items.push(plainToInstance(ItemObject, { itemId: targetActor.worn.boots, amount: 1 }));
            }
            targetActor.worn.boots = "";
        }
        if (targetActor.worn.mainhand != "") {
            const dropRoll = Math.floor(Math.random() * 101);
            if (dropRoll < itemDropChance) {
                this.lootbox.items.push(plainToInstance(ItemObject, { itemId: targetActor.worn.mainhand, amount: 1 }));
            }
            targetActor.worn.mainhand = "";
        }
        if (targetActor.worn.offhand != "") {
            const dropRoll = Math.floor(Math.random() * 101);
            if (dropRoll < itemDropChance) {
                this.lootbox.items.push(plainToInstance(ItemObject, { itemId: targetActor.worn.offhand, amount: 1 }));
            }
            targetActor.worn.offhand = "";
        }
        // TODO update database for targetActor's inventory & worn items
        await prisma.userEquipment.update({
            where: { username: username }, data: {
                inventory: { items: [] },
                worn: {
                    head: "",
                    torso: "",
                    legs: "",
                    boots: "",
                    mainhand: "",
                    offhand: "",
                }
            }
        })


        // Check if there's only one character left alive
        let totalUsers = 0;
        let deadUsers = 0;
        let winnerUsername = "";
        for (let user of this.users.entries()) {
            const actor = user[1].actor;
            totalUsers++;
            if (!actor.isAlive) {
                deadUsers++;
            } else {
                winnerUsername = user[1].username;
            }
        }
        if (totalUsers - deadUsers == 1) {
            // TODO: GAME END! check this on update()
            this.winnerUsername = winnerUsername;
            let winnerUserEquipment = await prisma.userEquipment.findUnique({ where: { username: winnerUsername } });
            for (let item of this.lootbox.items) {
                (winnerUserEquipment.vault as { itemId: string, amount: number }[]).push(item.toJSON())
            }
            await prisma.userEquipment.update({
                where: { username: winnerUsername },
                data: {
                    vault: winnerUserEquipment.vault
                }
            })
        }
    }
}