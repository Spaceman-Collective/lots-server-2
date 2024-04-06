import { Schema, Context } from "@colyseus/schema";
import { nanoid } from "nanoid";


const type = Context.create();

/**
 * Tracks position in the world
 */
export class EntitySchema extends Schema {
    @type("string") guid: string;
    @type("int32") x: number;
    @type("int32") y: number;

    constructor(spawn?: { x: number, y: number }) {
        super();
        this.guid = nanoid();
        if (spawn) {
            this.x = spawn.x;
            this.y = spawn.y;
        }
    }
}