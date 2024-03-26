import { Schema, type } from "@colyseus/schema";

export class RoomOptionsSchema extends Schema {
    @type("string") ownerUserName: string;
    @type("string") password: string;
    @type("uint8") maxPlayers: number;
    @type("string") map: string;

}