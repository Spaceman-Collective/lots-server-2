import { Schema, MapSchema, type } from "@colyseus/schema";
import { RoomOptionsSchema } from "./RoomOptions";
import { UserSchema } from "../User";
import { ActionArraySchema, ActionSchema } from "../Action";
import { Map } from "../Map";
import DefaultMap from '../../maps/default';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class BattleArenaRoomStateSchema extends Schema {
    @type("uint64") ticks: number;

    @type(RoomOptionsSchema) roomOptions: RoomOptionsSchema = new RoomOptionsSchema();
    @type(Map) map = new Map();

    // Client ID => User Object => Actor they control
    @type({ map: UserSchema }) users = new MapSchema<UserSchema>();
    @type({ map: "string" }) usernameToClientId = new MapSchema<string>();
    @type("boolean") inLobby: boolean;

    // Actor Queue System
    // Client Current Action (clientId => action)
    @type({ map: ActionSchema }) clientCurrentAction = new MapSchema<ActionSchema>();
    @type({ map: ActionSchema }) clientBufferedAction = new MapSchema<ActionSchema>();

    // Global Tick Q
    @type({ map: ActionArraySchema }) tickQ = new MapSchema<ActionArraySchema>();


    constructor(
        ownerUserName: string,
        password: string,
        maxPlayers: number,
        map: string,
    ) {
        super();
        this.ticks = 0;
        this.roomOptions.ownerUserName = ownerUserName;
        this.roomOptions.password = password;
        this.roomOptions.maxPlayers = maxPlayers;
        this.roomOptions.map = map;
        this.inLobby = true;

        switch (map) {
            case "DEFAULT":
                this.map = DefaultMap;
                break;
        }
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
        const targetUser = this.users.get(this.usernameToClientId.get(username)).actor.isAlive = false;
        // Reduce character amount from user characters
        const selectedCharacter = await prisma.userCharacters.findFirst({
            where: {
                username,
                selected: true
            }
        });

        if (selectedCharacter.amount > 1) {
            await prisma.userCharacters.update({
                where: {
                    id: selectedCharacter.id,
                },
                data: {
                    amount: {
                        decrement: 1
                    }
                }
            })
        } else if (selectedCharacter.amount == 1) {
            await prisma.userCharacters.delete({
                where: { id: selectedCharacter.id }
            })
        } //if -1 then they have infinite of that character

        // Dump character inventory in final loot box 
        // (each item has a 20% chance of ending up in the final lootbox)
    }
}