import { Schema, Context } from "@colyseus/schema";
import { Type as ClassType } from "class-transformer";
import { SkillsSchema, StatsSchema, VitalsSchema } from "./ActorInfo";

const type = Context.create();

export class ItemSchema extends Schema {
    @type("string") guid: string; //client will have item db locally and can look up items 

    @type("string") itemType: "WORN" | "BUFF" | "AMMO" | "CASTABLE";
    @type("uint32") stackSize: number;

    @ClassType(() => SkillsSchema)
    @type(SkillsSchema) requirements: SkillsSchema = new SkillsSchema();
}

export class WornItemSchema extends ItemSchema {
    @type("string") wornArea: "head" | "torso" | "legs" | "boots" | "mainhand" | "offhand";

    @ClassType(() => VitalsSchema)
    @type(VitalsSchema) wornVitalsModified: VitalsSchema = new VitalsSchema();

    @ClassType(() => StatsSchema)
    @type(StatsSchema) wornStatsModified: StatsSchema = new StatsSchema();
}

export class BuffItemSchema extends ItemSchema {
    @type("uint32") buffCastTime: number; //number of ticks for the animation to resovle before it takes effect
    @type("int32") tickDuration: number; // if -1, then permanent and doesn't require reverse

    @ClassType(() => VitalsSchema)
    @type(VitalsSchema) buffVitalsModified: VitalsSchema = new VitalsSchema();

    @ClassType(() => StatsSchema)
    @type(StatsSchema) buffStatsModified: StatsSchema = new StatsSchema();
}

export class AmmoItemSchema extends ItemSchema {
    @type("string") ammoType: string; // "small bullets" "arrows" "large bullets" "runes" etc

    @ClassType(() => StatsSchema)
    @type(StatsSchema) ammoStatsModified: StatsSchema = new StatsSchema();
}

export class CastableItemSchema extends ItemSchema {
    @type("uint32") castableCastTime: number; //number of ticks for the animation to resovle before it takes effect
    @type("int32") tileRange: number; // AoE if > 0
    @type("int32") castDuration: number; //-1 for instant & permanent, 0 or greater to add inverse effect

    // castableStats are for modifications (buff/debuff) to the target
    @ClassType(() => StatsSchema)
    @type(StatsSchema) castableStats: StatsSchema = new StatsSchema();

    // castableVitals are for modifications (buff/debuff) to the target
    @ClassType(() => VitalsSchema)
    @type(VitalsSchema) castableVitals: VitalsSchema = new VitalsSchema();

    // castableDamageStats are when treating this as a weapon and doing attacks with it
    @ClassType(() => StatsSchema)
    @type(StatsSchema) castableDamageStats: StatsSchema = new StatsSchema();
}