import "server-only";

export function mongoFailure(error: unknown) {
  if (error instanceof Error) {
    const code = "code" in error ? error.code : undefined;
    if (code === 18) return "authentication";
    if (code === 13) return "authorization";
    if (code === 85 || code === 86) return "index_conflict";
    if (error.name === "MongoServerSelectionError") return "server_selection";
    if (code === 50 || error.name === "MongoNetworkTimeoutError" || error.name === "MongoOperationTimeoutError") return "timeout";
    if (error.name === "MongoNetworkError") return "network";
  }
  return "driver_failure";
}

export class StorageError extends Error {
  constructor(readonly code: "configuration" | "unavailable" | "invalid_report" | "invalid_record" | "invalid_limit" | "invalid_lock" | "lock_lost", readonly diagnostic?: ReturnType<typeof mongoFailure>) {
    super(code);
    this.name = "StorageError";
  }
}
