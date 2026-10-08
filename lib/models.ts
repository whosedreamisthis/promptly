export interface ModelOption {
  id: string;
  label: string;
  description: string;
}

/** Gemini models available on the free tier; check https://ai.google.dev/gemini-api/docs/pricing before changing. */
export const FREE_TIER_MODELS = [
  {
    id: "gemini-3.5-flash-lite",
    label: "Gemini 3.5 Flash-Lite",
    description: "Fastest and lightest. Best for quick answers.",
  },
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    description: "Balanced speed and quality for everyday chats.",
  },
  {
    id: "gemini-3.1-flash-lite",
    label: "Gemini 3.1 Flash-Lite",
    description: "Previous generation, light and fast.",
  },
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    description: "Stable general-purpose model.",
  },
  {
    id: "gemini-2.5-flash-lite",
    label: "Gemini 2.5 Flash-Lite",
    description: "Stable and light, with the most free headroom.",
  },
] as const satisfies readonly ModelOption[];

export type FreeTierModelId = (typeof FREE_TIER_MODELS)[number]["id"];

export const FREE_TIER_MODEL_IDS = FREE_TIER_MODELS.map(
  (model) => model.id,
) as [FreeTierModelId, ...FreeTierModelId[]];

export const DEFAULT_MODEL: FreeTierModelId = "gemini-3.5-flash-lite";

/** Narrows a stored or submitted value to an allowed model, falling back to the default. */
export function resolveModel(value: string | null | undefined): FreeTierModelId {
  return FREE_TIER_MODEL_IDS.find((id) => id === value) ?? DEFAULT_MODEL;
}
