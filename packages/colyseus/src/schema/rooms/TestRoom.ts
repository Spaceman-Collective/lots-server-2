import { Schema, Context, type } from "@colyseus/schema";

export class TestRoomState extends Schema {

    @type("string") mySynchronizedProperty: string = "Hello world";

}