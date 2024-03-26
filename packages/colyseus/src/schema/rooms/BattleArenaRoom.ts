import { Schema, MapSchema, type } from "@colyseus/schema";
import { RoomOptionsSchema } from "./RoomOptions";
import { UserSchema } from "../User";
import { ActionArraySchema, ActionSchema } from "../Action";
import { Map } from "../Map";
import DefaultMap from '../../maps/default';

export class BattleArenaRoomStateSchema extends Schema {
    @type("uint64") ticks: number;

    @type(RoomOptionsSchema) roomOptions: RoomOptionsSchema;
    @type(Map) map = new Map();

    // Client ID => User Object => Actor they control
    @type({ map: UserSchema }) users = new MapSchema<UserSchema>();
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
        this.roomOptions.ownerUserName = ownerUserName;
        this.roomOptions.password = password;
        this.roomOptions.maxPlayers = maxPlayers;
        this.roomOptions.map = map;
        this.inLobby = true;

        switch (map) {
            case "default":
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
}