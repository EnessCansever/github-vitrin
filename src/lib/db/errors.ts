import "server-only";

export class StorageError extends Error {
  constructor(readonly code: "configuration" | "unavailable" | "invalid_report" | "invalid_record") {
    super(code);
    this.name = "StorageError";
  }
}
