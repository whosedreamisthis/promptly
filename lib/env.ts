/** Reads a positive integer from an environment variable, or `fallback` when it is unset or invalid. */
export function positiveIntFromEnv(name: string, fallback: number): number {
  const configured = Number(process.env[name]);
  return Number.isInteger(configured) && configured > 0 ? configured : fallback;
}
