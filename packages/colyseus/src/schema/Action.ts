import { Schema, ArraySchema, Context } from "@colyseus/schema";

const type = Context.create();

export class ActionSchema extends Schema {
    @type("string") actionType: string; // "MOVE" | "ATTACK" | "ITEM"
    @type("string") reqId: string; //random id given by client for this request to check if it made it to the server
    @type("string") clientId: string; // client who initiated the action
    @type("string") payload: string; // json payload of the message
    @type("string") tickStartedAt: string;
    @type("string") tickEndsAt: string;
    @type("string") serverPayload: string; // stringified json of any server message attached to this
}

export class ActionArraySchema extends Schema {
    @type([ActionSchema]) actions = new ArraySchema<ActionSchema>();

    constructor(actions: ActionSchema[]) {
        super();
        this.actions.push(...actions)
    }
}