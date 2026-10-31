import "server-only";

export class StorageError extends Error {
  constructor(readonly code: "configuration" | "unavailable" | "invalid_report" | "invalid_record" | "invalid_limit") {
    super(code);
    this.name = "StorageError";
  }
}
