import { z } from "zod";
import { FREE_TIER_MODEL_IDS } from "@/lib/models";

export const setModelSchema = z.object({ model: z.enum(FREE_TIER_MODEL_IDS) });

export type SetModelInput = z.infer<typeof setModelSchema>;
