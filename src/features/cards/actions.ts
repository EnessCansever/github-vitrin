"use server";

import {getLocale} from "next-intl/server";
import {z} from "zod";
import {readSnapshot} from "../../lib/db/snapshots";
import {readToken, snapshotId} from "../../lib/db/snapshot-schema";
import {compareReports} from "../reports/comparison";
import {cardContent, progressContent} from "./content";
import {cachedCard} from "./cache";
import {StorageError} from "../../lib/db/errors";
import {cardFormats, type CardResponse} from "./types";
import {limitRequest, requestFailure} from "../../lib/security/requests";

const inputSchema = z.strictObject({id: snapshotId, token: readToken, previous: z.strictObject({id: snapshotId, token: readToken}).optional(), format: z.enum(["story", "post", "landscape"])});

export async function generateCard(input: unknown): Promise<CardResponse> {
  try {
    await limitRequest("card");
  } catch (error) {
    return {status: "error", ...(requestFailure(error) ?? {code: "unavailable" as const})};
  }
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return {status: "error", code: "invalid"};
  const {id, token, previous, format} = parsed.data;
  let snapshot, earlier;
  try {
    [snapshot, earlier] = await Promise.all([
      readSnapshot(id, token), previous && readSnapshot(previous.id, previous.token),
    ]);
  } catch {
    return {status: "error", code: "unavailable"};
  }
  if (!snapshot || (previous && !earlier)) return {status: "error", code: "missing"};
  const expiry = Math.min(Date.parse(snapshot.expiresAt), earlier ? Date.parse(earlier.expiresAt) : Infinity);
  if (expiry <= Date.now()) return {status: "error", code: "missing"};
  try {
    const locale = await getLocale() === "en" ? "en" : "tr";
    let png;
    if (earlier) {
      const comparison = compareReports(earlier.report, snapshot.report);
      if (comparison.status === "blocked") return {status: "error", code: comparison.reason === "incomplete" ? "incomplete" : "incompatible"};
      png = await cachedCard("comparison", [earlier.id, snapshot.id], new Date(expiry).toISOString(),
        locale, format, progressContent(comparison, locale));
    } else {
      const content = cardContent(snapshot.report, locale);
      if (!content) return {status: "error", code: "incomplete"};
      png = await cachedCard("snapshot", snapshot.id, snapshot.expiresAt, locale, format, content);
    }
    if (expiry <= Date.now()) return {status: "error", code: "missing"};
    return {status: "success", png: Buffer.from(png).toString("base64"), format: parsed.data.format,
      locale, ...cardFormats[parsed.data.format]};
  } catch (error) {
    return {status: "error", code: error instanceof StorageError ? "unavailable" : "render"};
  }
}
