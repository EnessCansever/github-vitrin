import "server-only";

export class StorageError extends Error {
  constructor(readonly code: "configuration" | "unavailable" | "invalid_report" | "invalid_record" | "invalid_limit" | "invalid_lock" | "lock_lost") {
    super(code);
    this.name = "StorageError";
  }
}
