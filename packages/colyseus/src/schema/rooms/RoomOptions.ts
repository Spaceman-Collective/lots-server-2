import { Schema, Context } from "@colyseus/schema";

const type = Context.create();

export class RoomOptionsSchema extends Schema {
    @type("string") ownerUserName: string;
    @type("string") password: string;
    @type("uint8") maxPlayers: number;
    @type("string") mapName: string;

}