import { Schema, ArraySchema, Context } from "@colyseus/schema";
import { EntitySchema } from "./Entity";
import { Type as ClassType } from "class-transformer";

const type = Context.create();

// Tracks various health pools and run energy
export class VitalsSchema extends Schema {
    @type("number") health: number; //starts at 1000
    @type("number") healthMax: number;
    @type("number") healthRecovery: number; // per tick, applied every 10 ticks (1s)

    // Protects against TECH attacks
    @type("number") shields: number; //starts at 0
    @type("number") shieldsMax: number;
    @type("number") shieldsRecovery: number;

    // Protects against PHYSICAL Attacks
    @type("number") armor: number; //starts at 0
    @type("number") armorMax: number;
    @type("number") armorRecovery: number;

    // Protects against MAGIC Attacks
    @type("number") barrier: number; //starts at 0
    @type("number") barrierMax: number;
    @type("number") barrierRecovery: number;

    // Determines RUN duration
    @type("number") stamina: number; //starts at 100
    @type("number") staminaMax: number;
    @type("number") staminaRecovery: number;
}

/**
 * Combat Formula
 * - See if the attack lands based on ACCURACY of weapon
 * - Do damage to the appropriate health pool(s) based on dmg type
 * - if it's depleated, do damage to base health
 */
export class StatsSchema extends Schema {
    @type("number") damageMin: number;
    @type("number") damageMax: number;
    @type("number") accuracy: number; // roll a number out of 10k. if it's under the accuracy number it's a hit
    @type("number") dodge: number; //out of 10k, subtracted from enemy attack roll
    @type("number") range: number; //number of tiles away the user can be
    @type("number") speed: number; //number of attacks per 1s (10 ticks)
    @type("number") critChance: number; // roll a number out of 10k, if it's under this crit chance number, it's a crit
    @type("number") critMultiplier: number; //1.2 would be stored as 120 so we can do full ints (divide by 100 in the resolve)
    @type("string") damageType: "NA" | "PHYS" | "TECH" | "MAGIC"; //what health pool the damage applies to
    //always attack with your mainhand weapon, offhand just gives boost to stats
    @type("string") weaponType: "NA" | "FIGHTING" | "RANGED" | "MAGIC" | "FIREARMS" | "TECH";
    @type("string") ammoTypeRequired: string; // what type of ammo is required for the weapon
    @type("number") ammoInventoryIdx: number; //idx of the item used as ammo,
}

// Adds bonuses when using specific type of weapons
// Between 1-10
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
    @ClassType(() => ArraySchema<ItemObject>)
    @type([ItemObject])
    items: ArraySchema<ItemObject> = new ArraySchema<ItemObject>();
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
    @type(VitalsSchema) vitals: VitalsSchema = new VitalsSchema();

    @ClassType(() => StatsSchema)
    @type(StatsSchema) stats: StatsSchema = new StatsSchema();

    @ClassType(() => SkillsSchema)
    @type(SkillsSchema) skills: SkillsSchema = new SkillsSchema();

    @ClassType(() => InventorySchema)
    @type(InventorySchema) inventory: InventorySchema = new InventorySchema();

    @ClassType(() => WornSchema)
    @type(WornSchema) worn: WornSchema = new WornSchema();

    @type("boolean") isAlive: boolean = true;
}