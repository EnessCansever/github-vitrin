import {Binary} from "mongodb";
import {vi} from "vitest";

type Entry = {expiresAt: Date; png: Binary};
export const entries = new Map<string, Entry>();
export const images = {
  createIndex: vi.fn(),
  findOne: vi.fn(async ({_id, expiresAt}: {_id: string; expiresAt: {$gt: Date}}) => {
    const value = entries.get(_id);
    return value && value.expiresAt > expiresAt.$gt ? value : null;
  }),
  updateOne: vi.fn(async ({_id}: {_id: string}, {$set}: {$set: Entry}) => {
    entries.set(_id, $set);
  }),
};
export const imageDatabase = {getDatabase: async () => ({collection: () => images}), dbMaxTimeMs: 4000, dbWriteConcern: {w: "majority"}};
