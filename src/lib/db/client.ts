import "server-only";

import {MongoClient, type Db} from "mongodb";
import {StorageError} from "./errors";

const state = globalThis as typeof globalThis & {repoVitrinDb?: Promise<Db>};
export const dbMaxTimeMs = 4_000;
export const dbWriteConcern = {w: "majority", wtimeoutMS: dbMaxTimeMs} as const;

export function getDatabase(): Promise<Db> {
  if (state.repoVitrinDb) return state.repoVitrinDb;
  const uri = process.env.MONGODB_URI?.trim();
  const name = process.env.MONGODB_DB?.trim();
  if (!uri || !/^mongodb(?:\+srv)?:\/\//.test(uri) || !name || !/^[a-zA-Z\d_-]{1,63}$/.test(name)) {
    throw new StorageError("configuration");
  }
  let client: MongoClient;
  try {
    client = new MongoClient(uri, {
      maxPoolSize: 10, minPoolSize: 0, maxIdleTimeMS: 60_000,
      serverSelectionTimeoutMS: 2_000, connectTimeoutMS: 2_000,
      waitQueueTimeoutMS: 1_000, socketTimeoutMS: 5_000,
      retryReads: false, retryWrites: false,
    });
  } catch {
    throw new StorageError("configuration");
  }
  state.repoVitrinDb = client.connect().then(() => client.db(name)).catch(async () => {
    delete state.repoVitrinDb;
    try {
      await client.close();
    } finally {
      throw new StorageError("unavailable");
    }
  });
  return state.repoVitrinDb;
}
