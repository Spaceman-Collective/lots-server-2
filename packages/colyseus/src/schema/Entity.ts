import { Schema, type } from "@colyseus/schema";
import { nanoid } from "nanoid";

/**
 * Tracks position in the world
 */
export class EntitySchema extends Schema {
    @type("string") guid: string;
    @type("uint32") x: number;
    @type("uint32") y: number;

    constructor() {
        super();
        this.guid = nanoid();
        this.x = 0;
        this.y = 0;
    }
}