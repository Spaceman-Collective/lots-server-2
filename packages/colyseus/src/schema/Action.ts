import { Schema, ArraySchema, type } from "@colyseus/schema";

export class ActionSchema extends Schema {
    @type("string") actionType: string; // "MOVE" | "ATTACK" | "CONSUME"
    @type("string") reqId: string; //random id given by client for this request to check if it made it to the server
    @type("string") clientId: string; // client who initiated the action
    @type("string") payload: string; // json payload of the message
    @type("string") tickStartedAt: string;
    @type("string") tickEndsAt: string;
}

export class ActionArraySchema extends Schema {
    @type([ActionSchema]) actions = new ArraySchema<ActionSchema>();

    constructor(actions: ActionSchema[]) {
        super();
        this.actions.push(...actions)
    }
}