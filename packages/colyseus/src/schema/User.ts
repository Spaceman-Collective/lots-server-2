import { Schema, Context } from "@colyseus/schema";
import { ActorSchema } from "./Actor";
import { Type as ClassType } from "class-transformer";

const type = Context.create();

/**
 * Tracks position in the world
 */
export class UserSchema extends Schema {
    @type("string") username: string;
    @type("string") displayName: string;

    @ClassType(() => ActorSchema)
    @type(ActorSchema) actor: ActorSchema;
}