import { Schema, ArraySchema, type } from "@colyseus/schema";
import { EntitySchema } from "./Entity";
import { Type as ClassType } from "class-transformer";


// Tracks various health pools and run energy
export class VitalsSchema extends Schema {
    @type("number") health: number;
    @type("number") healthMax: number;

    // Protects against TECH attacks
    @type("number") shields: number;
    @type("number") shieldsMax: number;

    // Protects against PHYSICAL Attacks
    @type("number") armor: number;
    @type("number") armorMax: number;

    // Protects against MAGIC Attacks
    @type("number") barrier: number;
    @type("number") barrierMax: number;

    // Determines RUN duration
    @type("number") stamina: number;
    @type("number") staminaMax: number;
}

/**
 * Combat Formula
 * - See if the attack lands based on ACCURACY of weapon minus RANGE
 * - Do damage to the appropriate health pool(s) based on dmg type
 * - if it's depleated, do damage to base health
 */
export class OffensiveStatsSchema extends Schema {
    @type("number") damage: number;
    @type("number") accuracy: number;
    @type("number") range: number;
    @type("number") speed: number;
    @type("number") critChance: number;
    @type("number") critMultiplier: number;
    @type("string") damageType: "PHYS" | "TECH" | "MAGIC";
}

// Adds bonuses when using specific type of weapons
export class SkillsSchema extends Schema {
    @type("number") fighting: number;
    @type("number") ranged: number;
    @type("number") magic: number;
    @type("number") firearms: number;
    @type("number") tech: number;
}

export class ItemObject extends Schema {
    @type("string") itemId: string;
    @type("number") amount: number;
}

export class InventorySchema extends Schema {
    @type("number") slots: number;
    @ClassType(() => ArraySchema<ItemObject>)
    @type([ItemObject])
    items: ArraySchema<ItemObject>;
}

// ID for what item is worn in given slots
export class WornSchema extends Schema {
    @type("string") head: string;
    @type("string") torso: string;
    @type("string") legs: string;
    @type("string") boots: string;
    @type("string") mainhand: string;
    @type("string") offhand: string;
}

/**
 * Actor is an entity with stats and equipment
 */
export class ActorSchema extends EntitySchema {
    @ClassType(() => VitalsSchema)
    @type(VitalsSchema) vitals: VitalsSchema;

    @ClassType(() => OffensiveStatsSchema)
    @type(OffensiveStatsSchema) stats: OffensiveStatsSchema;

    @ClassType(() => SkillsSchema)
    @type(SkillsSchema) skills: SkillsSchema;

    @ClassType(() => InventorySchema)
    @type(InventorySchema) inventory: InventorySchema;

    @ClassType(() => WornSchema)
    @type(WornSchema) worn: WornSchema
}