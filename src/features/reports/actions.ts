"use server";

import {z} from "zod";
import {readSnapshot} from "../../lib/db/snapshots";
import {readToken, snapshotId} from "../../lib/db/snapshot-schema";
import type {StoredReportResponse} from "../analysis/report";
import {limitRequest, requestFailure} from "../../lib/security/requests";
import {compareReports, type ComparisonResponse} from "./comparison";

const accessSchema = z.strictObject({id: snapshotId, token: readToken});

export async function loadComparison(input: unknown): Promise<ComparisonResponse> {
  try {
    await limitRequest("report");
  } catch (error) {
    const failure = requestFailure(error);
    if (failure?.code === "rateLimit" && failure.retryAt) return {status: "rateLimit", retryAt: failure.retryAt};
    return {status: failure?.code === "configuration" ? "configuration" : "unavailable"};
  }
  const parsed = z.strictObject({before: accessSchema, after: accessSchema}).safeParse(input);
  if (!parsed.success) return {status: "missing"};
  try {
    const [before, after] = await Promise.all([
      readSnapshot(parsed.data.before.id, parsed.data.before.token),
      readSnapshot(parsed.data.after.id, parsed.data.after.token),
    ]);
    if (!before || !after) return {status: "missing"};
    // The first read may expire while the second one is still pending.
    if (Math.min(Date.parse(before.expiresAt), Date.parse(after.expiresAt)) <= Date.now()) return {status: "missing"};
    return {status: "success", comparison: compareReports(before.report, after.report)};
  } catch {
    return {status: "unavailable"};
  }
}

export async function loadReport(input: unknown): Promise<StoredReportResponse> {
  try {
    await limitRequest("report");
  } catch (error) {
    const failure = requestFailure(error);
    if (failure?.code === "rateLimit" && failure.retryAt) return {status: "rateLimit", retryAt: failure.retryAt};
    return {status: failure?.code === "configuration" ? "configuration" : "unavailable"};
  }
  const parsed = accessSchema.safeParse(input);
  if (!parsed.success) return {status: "missing"};
  try {
    const snapshot = await readSnapshot(parsed.data.id, parsed.data.token);
    if (!snapshot) return {status: "missing"};
    return {status: "success", report: snapshot.report, expiresAt: snapshot.expiresAt};
  } catch {
    return {status: "unavailable"};
  }
}
