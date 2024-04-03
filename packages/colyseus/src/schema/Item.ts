import { Schema, Context } from "@colyseus/schema";
import { Type as ClassType } from "class-transformer";
import { SkillsSchema, StatsSchema, VitalsSchema } from "./Actor";

const type = Context.create();

export class ItemSchema extends Schema {
    @type("string") guid: string;
    @type("string") itemType: "WORN" | "BUFF" | "AMMO" | "CASTABLE";
    @type("number") stackSize: number;

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
    @type("number") buffCastTime: number; //number of ticks for the animation to resovle before it takes effect
    @type("number") tickDuration: number; // if -1, then permanent and doesn't require reverse

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
    @type("number") castableCastTime: number; //number of ticks for the animation to resovle before it takes effect
    @type("number") tileRange: number; // AoE if > 0
    @type("number") castDuration: number;

    @ClassType(() => StatsSchema)
    @type(StatsSchema) castableStats: StatsSchema = new StatsSchema();

    @ClassType(() => VitalsSchema)
    @type(VitalsSchema) castableVitals: VitalsSchema = new VitalsSchema();
}