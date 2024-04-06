import { Schema, ArraySchema, Context } from "@colyseus/schema";
import { EntitySchema } from "./Entity";
import { Type as ClassType, plainToInstance } from "class-transformer";
import { PrismaClient } from "@prisma/client";
import { modifyStats, modifyVitals } from "../handlers/item";
import { WornItemSchema } from "./Item";
import { SkillsSchema, StatsSchema, VitalsSchema } from "./ActorInfo";
const prisma = new PrismaClient();

const type = Context.create();

export class ItemObject extends Schema {
    @type("string") itemId: string;
    @type("uint32") amount: number;
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

    async processEquipment() {
        const items = await prisma.itemLibrary.findMany({
            where: {
                id: {
                    in: [
                        this.worn.head ? this.worn.head : undefined,
                        this.worn.torso ? this.worn.torso : undefined,
                        this.worn.legs ? this.worn.legs : undefined,
                        this.worn.boots ? this.worn.boots : undefined,
                        this.worn.mainhand ? this.worn.mainhand : undefined,
                        this.worn.offhand ? this.worn.offhand : undefined
                    ].filter((x) => x != undefined)
                }
            }
        })

        for (let item of items) {
            const wornItem = plainToInstance(WornItemSchema, item.data);
            modifyVitals(this.vitals, wornItem.wornVitalsModified);
            modifyStats(this.stats, wornItem.wornStatsModified);
        }

    }
}