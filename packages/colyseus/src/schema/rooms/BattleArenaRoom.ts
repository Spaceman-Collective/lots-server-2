import { Schema, MapSchema, type } from "@colyseus/schema";
import { RoomOptionsSchema } from "./RoomOptions";
import { UserSchema } from "../User";

export class BattleArenaRoomStateSchema extends Schema {
    @type(RoomOptionsSchema) roomOptions: RoomOptionsSchema;

    // Client ID => User Object => Actor they control
    @type({ map: UserSchema }) users = new MapSchema<UserSchema>();

    constructor(
        password: string,
        maxPlayers: number,
        map: string,
    ) {
        super();
        this.roomOptions.password = password;
        this.roomOptions.maxPlayers = maxPlayers;
        this.roomOptions.map = map;
    }
}