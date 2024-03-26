import { Schema, type } from "@colyseus/schema";

/**
 * Tracks position in the world
 */
export class EntitySchema extends Schema {
    @type("string") guid: string;
    @type("uint32") x: number;
    @type("uint32") y: number;
}