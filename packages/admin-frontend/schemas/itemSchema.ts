import { z } from "zod";

const ProficiencySchema = z.object({
  level: z.number(),
});

const ProficienciesSchema = z.record(z.object({
  swords: ProficiencySchema.optional(),
  shortArms: ProficiencySchema.optional(),
  longArms: ProficiencySchema.optional(),
  daggers: ProficiencySchema.optional(),
  special: ProficiencySchema.optional(),
  bows: ProficiencySchema.optional(),
  crossbows: ProficiencySchema.optional(),
  thrown: ProficiencySchema.optional(),
  pistols: ProficiencySchema.optional(),
  smgs: ProficiencySchema.optional(),
  rifles: ProficiencySchema.optional(),
  shotguns: ProficiencySchema.optional(),
  spells: ProficiencySchema.optional(),
  miracles: ProficiencySchema.optional(),
  summoning: ProficiencySchema.optional(),
  gadgets: ProficiencySchema.optional(),
  nanotech: ProficiencySchema.optional(),
  drones: ProficiencySchema.optional(),
}));

const VitalsSchema = z.object({
  current: z.number().optional(),
  max: z.number().optional(),
}).optional();

const EffectsSchema = z.object({
  attributes: z.object({
    strength: z.number(),
  }).optional(),
  proficiencies: ProficienciesSchema.optional(),
  inventory: z.object({
    slots: z.number(),
    items: z.array(z.any()), // Assuming items can be of any type; adjust as necessary.
  }).optional(),
  vitals: z.object({
    health: VitalsSchema.optional(),
    shields: VitalsSchema.optional(),
    barrier: VitalsSchema.optional(),
    stamina: z.object({
      current: z.number(),
    }).optional(),
  }).optional(),
}).refine(data => Object.keys(data).length > 0, { message: "Effects must have at least one field defined." });

export const ItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  stackSize: z.number().min(1),
  equipableSlot: z.enum(["NONE", "HEAD", "NECKLACE", "TORSO", "LEGS", "BOOTS", "GLOVES", "RING", "MAINHAND", "OFFHAND", "BACKPACK", "AMMO", "POCKET"]),
  targettable: z.boolean(),
  consumable: z.boolean(),
  effects: z.preprocess((arg) => {
    if (typeof arg === 'string') {
      try {
        return JSON.parse(arg);
      } catch (e) {
        return null;
      }
    }
    return arg;
  }, EffectsSchema),
});