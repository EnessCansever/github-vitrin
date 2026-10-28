import {MongoClient} from "mongodb";
import {beforeEach, expect, it, vi} from "vitest";
import {getDatabase} from "../../src/lib/db/client";

const fake = vi.hoisted(() => ({connect: vi.fn(), close: vi.fn(), db: vi.fn()}));
vi.mock("mongodb", () => ({MongoClient: vi.fn()}));

beforeEach(() => {
  vi.stubGlobal("repoVitrinDb", undefined);
  vi.stubEnv("MONGODB_URI", "mongodb://127.0.0.1:27017");
  vi.stubEnv("MONGODB_DB", "repovitrin_test");
  fake.connect.mockReset().mockResolvedValue(undefined);
  fake.close.mockReset().mockResolvedValue(undefined);
  fake.db.mockReset().mockReturnValue({databaseName: "repovitrin_test"});
  vi.mocked(MongoClient).mockReset().mockImplementation(function () {
    return {connect: fake.connect, close: fake.close, db: fake.db};
  });
});

it("does not require configuration at import and opens one shared pool only on use", async () => {
  expect(MongoClient).not.toHaveBeenCalled();
  const [first, second] = await Promise.all([getDatabase(), getDatabase()]);
  expect(first).toBe(second);
  await getDatabase();
  expect(MongoClient).toHaveBeenCalledTimes(1);
  expect(fake.connect).toHaveBeenCalledTimes(1);
  expect(fake.close).not.toHaveBeenCalled();
  expect(vi.mocked(MongoClient).mock.calls[0][1]).toMatchObject({maxPoolSize: 10, minPoolSize: 0, timeoutMS: 8000, serverSelectionTimeoutMS: 5000});
});

it("can import without database secrets and only fails when called", async () => {
  vi.stubEnv("MONGODB_URI", "");
  vi.stubEnv("MONGODB_DB", "");
  vi.resetModules();
  const client = await import("../../src/lib/db/client");
  expect(MongoClient).not.toHaveBeenCalled();
  expect(() => client.getDatabase()).toThrowError("configuration");
});

it.each([
  {MONGODB_URI: ""}, {MONGODB_DB: ""}, {MONGODB_URI: "https://invalid.invalid"}, {MONGODB_DB: "invalid/name"},
])("rejects missing/invalid configuration at call time: %j", patch => {
  for (const [key, value] of Object.entries(patch)) vi.stubEnv(key, value);
  expect(() => getDatabase()).toThrowError("configuration");
  expect(MongoClient).not.toHaveBeenCalled();
});

it("sanitizes malformed driver configuration", () => {
  vi.mocked(MongoClient).mockImplementationOnce(function () {throw new Error("sensitive URI");});
  expect(() => getDatabase()).toThrowError("configuration");
});

it.each([false, true])("clears a rejected connection and permits a later explicit call; close failure=%s", async closeFailure => {
  fake.connect.mockRejectedValueOnce(new Error("sensitive URI"));
  if (closeFailure) fake.close.mockRejectedValueOnce(new Error("sensitive close error"));
  const results = await Promise.allSettled([getDatabase(), getDatabase()]);
  expect(results).toEqual([
    {status: "rejected", reason: expect.objectContaining({code: "unavailable", message: "unavailable"})},
    {status: "rejected", reason: expect.objectContaining({code: "unavailable", message: "unavailable"})},
  ]);
  expect(fake.close).toHaveBeenCalledTimes(1);
  expect(fake.connect).toHaveBeenCalledTimes(1);
  await getDatabase();
  expect(fake.connect).toHaveBeenCalledTimes(2);
});
