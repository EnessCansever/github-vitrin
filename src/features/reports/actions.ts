"use server";

import {z} from "zod";
import {readSnapshot} from "../../lib/db/snapshots";
import {readToken, snapshotId} from "../../lib/db/snapshot-schema";
import type {StoredReportResponse} from "../analysis/report";
import {limitRequest, requestFailure} from "../../lib/security/requests";

const accessSchema = z.strictObject({id: snapshotId, token: readToken});

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
