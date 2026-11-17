import {createHash} from "node:crypto";
import {beforeEach, expect, it, vi} from "vitest";
import {createShare, readShare, manageShare} from "../../src/lib/db/share-reports";
import {shareRecordSchema, shareSummary, shareSummarySchema, SHARE_TTL_MS} from "../../src/lib/db/share-schema";
import {report} from "../db/fixtures";

const db = vi.hoisted(() => ({get: vi.fn(), collection: vi.fn(), createIndex: vi.fn(), insertOne: vi.fn(), findOne: vi.fn(),updateOne:vi.fn(),deleteOne:vi.fn()}));
vi.mock("../../src/lib/db/client", async original => ({...await original<typeof import("../../src/lib/db/client")>(), getDatabase: db.get}));
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-17T13:00:00Z"));
  db.get.mockReset().mockResolvedValue({collection: db.collection});
  db.collection.mockReset().mockReturnValue({createIndex: db.createIndex, insertOne: db.insertOne, findOne: db.findOne,updateOne:db.updateOne,deleteOne:db.deleteOne});
  db.createIndex.mockReset().mockResolvedValue("share_expiry");db.insertOne.mockReset().mockResolvedValue({acknowledged: true});db.findOne.mockReset().mockResolvedValue(null);db.updateOne.mockReset().mockResolvedValue({acknowledged:true,matchedCount:1});db.deleteOne.mockReset().mockResolvedValue({acknowledged:true,deletedCount:1});
});
const saved = () => shareRecordSchema.parse(db.insertOne.mock.calls.at(-1)![0]);

it.each([false, true])("copies only minimal public fields with original scores/time and preserves incomplete=%s", incomplete => {
  const value = report(3, incomplete), original = structuredClone(value);
  const summary = shareSummary(value);
  expect(Object.keys(summary).sort()).toEqual(["repos","profile","checkedAt","rulesVersion","status","score","profileType","categories","firstTask"].sort());
  expect(summary.profile).toEqual({login: value.profile.login});
  expect(summary.checkedAt).toBe(value.checkedAt);expect(summary.score).toBe(value.score);
  expect(summary.profileType).toBe(value.profileType?.id ?? null);
  expect(summary.firstTask?.suggestionKey).toBe(value.recommendations[0]?.suggestionKey);
  expect(summary).not.toHaveProperty("checks");expect(summary).not.toHaveProperty("source");
  expect(summary).not.toHaveProperty("readToken");expect(summary).not.toHaveProperty("history");
  expect(value).toEqual(original);
  expect(shareSummarySchema.safeParse({...summary, privateToken:"forbidden"}).success).toBe(false);
});

it("creates a separate immutable 90-day copy with a 192-bit ID and only a hash of the management capability", async () => {
  const access = await createShare(report()); const record = saved();
  expect(access.id).toMatch(/^[a-f\d]{48}$/);expect(access.managementToken).toMatch(/^[a-f\d]{64}$/);
  expect(record.managementHash).toBe(createHash("sha256").update(access.managementToken).digest("hex"));
  expect(JSON.stringify(record)).not.toContain(access.managementToken);
  expect(record.expiresAt.getTime()-record.createdAt.getTime()).toBe(SHARE_TTL_MS);
  expect(record.summary.checkedAt).toBe(report().checkedAt);
  expect(db.createIndex).toHaveBeenCalledWith({expiresAt:1},{name:"share_expiry",expireAfterSeconds:0},{maxTimeMS:4000,writeConcern:{w:"majority",wtimeoutMS:4000}});
  expect(db.collection).toHaveBeenCalledWith("shareReports");
  const second = await createShare(report());expect(second.id).not.toBe(access.id);
});

it("public read needs only the share ID and never returns private access, management hash or device history", async () => {
  const access = await createShare(report());db.findOne.mockResolvedValue(saved());
  const result = await readShare(access.id);
  expect(Object.keys(result!).sort()).toEqual(["id","createdAt","expiresAt","summary"].sort());
  expect(JSON.stringify(result)).not.toContain(access.managementToken);
  expect(JSON.stringify(result)).not.toContain(saved().managementHash);
  expect(result).not.toHaveProperty("snapshotId");expect(result).not.toHaveProperty("history");
  expect(db.findOne).toHaveBeenCalledWith({_id:access.id,closedAt:null,expiresAt:{$gt:new Date()}},{maxTimeMS:4000});
  expect(fetch).not.toHaveBeenCalled();
});

it("rejects expiry in application logic even when TTL has not removed the record, and does not extend its life", async () => {
  const access = await createShare(report()), record = saved();db.findOne.mockResolvedValue(record);
  vi.advanceTimersByTime(30*86400000);expect(await readShare(access.id)).not.toBeNull();
  expect(saved().expiresAt).toEqual(record.expiresAt);
  vi.advanceTimersByTime(60*86400000);expect(await readShare(access.id)).toBeNull();
  expect(db.insertOne).toHaveBeenCalledTimes(1);
});

it("rejects malformed inputs before DB access and distinguishes corrupt storage/DB errors from absence", async () => {
  expect(await readShare("wrong")).toBeNull();expect(db.get).not.toHaveBeenCalled();
  await expect(createShare({...report(),readToken:"forbidden",history:[]})).rejects.toMatchObject({code:"invalid_report"});
  expect(db.get).not.toHaveBeenCalled();
  const access=await createShare(report());db.findOne.mockResolvedValue({...saved(),snapshotToken:"forbidden"});
  await expect(readShare(access.id)).rejects.toMatchObject({code:"invalid_record"});
  db.findOne.mockRejectedValue(new Error("sensitive database diagnostics"));
  await expect(readShare(access.id)).rejects.toMatchObject({code:"unavailable",message:"unavailable"});
});


it("uses the separate management capability to close after day 31, without changing content or extending expiry", async()=>{
 const access=await createShare(report()), original=saved();vi.advanceTimersByTime(31*86400000);
 db.findOne.mockResolvedValue(original);expect(await readShare(access.id)).not.toBeNull();
 expect(await manageShare(access.id,access.managementToken,"close")).toBe(true);
 expect(db.updateOne).toHaveBeenCalledWith({_id:access.id,managementHash:original.managementHash},[{$set:{closedAt:{$ifNull:["$closedAt","$$NOW"]}}}],{maxTimeMS:4000,writeConcern:{w:"majority",wtimeoutMS:4000}});
 db.findOne.mockResolvedValue({...original,closedAt:new Date()});expect(await readShare(access.id)).toBeNull();
 expect(original.summary).toEqual(shareSummary(report()));expect(original.expiresAt.getTime()-original.createdAt.getTime()).toBe(SHARE_TTL_MS);
 expect(db.collection.mock.calls.every(([name])=>name==="shareReports")).toBe(true);
});
it("physically deletes only the identified management-authorized copy, including closed/expired records", async()=>{
 const access=await createShare(report());vi.advanceTimersByTime(91*86400000);
 expect(await manageShare(access.id,access.managementToken,"delete")).toBe(true);
 expect(db.deleteOne).toHaveBeenCalledExactlyOnceWith({_id:access.id,managementHash:saved().managementHash},{maxTimeMS:4000,writeConcern:{w:"majority",wtimeoutMS:4000}});
 db.findOne.mockResolvedValue(null);expect(await readShare(access.id)).toBeNull();
});
it("rejects missing/wrong management access and treats DB mutation errors as unavailable", async()=>{
 expect(await manageShare("wrong","wrong","delete")).toBe(false);expect(db.get).not.toHaveBeenCalled();
 const access=await createShare(report());db.deleteOne.mockResolvedValue({acknowledged:true,deletedCount:0});
 expect(await manageShare(access.id,"f".repeat(64),"delete")).toBe(false);
 expect(db.deleteOne.mock.calls.at(-1)![0].managementHash).toBe(createHash("sha256").update("f".repeat(64)).digest("hex"));
 db.updateOne.mockResolvedValue({acknowledged:true,matchedCount:0});expect(await manageShare(access.id,"f".repeat(64),"close")).toBe(false);
 db.updateOne.mockRejectedValue(new Error("private diagnostics"));await expect(manageShare(access.id,access.managementToken,"close")).rejects.toMatchObject({code:"unavailable"});
});
