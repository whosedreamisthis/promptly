export const DB_UNREACHABLE_CODE = "P1001";
export const UNIQUE_VIOLATION_CODE = "P2002";
export const WRITE_CONFLICT_CODE = "P2034";

/** True when the error carries the given Prisma error code. */
export function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}
