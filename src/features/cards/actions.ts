"use server";

import {getLocale} from "next-intl/server";
import {z} from "zod";
import {readSnapshot} from "../../lib/db/snapshots";
import {readToken, snapshotId} from "../../lib/db/snapshot-schema";
import {cardContent} from "./content";
import {cachedCard} from "./cache";
import {StorageError} from "../../lib/db/errors";
import {cardFormats, type CardResponse} from "./types";
import {limitRequest, requestFailure} from "../../lib/security/requests";

const inputSchema = z.strictObject({id: snapshotId, token: readToken, format: z.enum(["story", "post", "landscape"])});

export async function generateCard(input: unknown): Promise<CardResponse> {
  try {
    await limitRequest("card");
  } catch (error) {
    return {status: "error", ...(requestFailure(error) ?? {code: "unavailable" as const})};
  }
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return {status: "error", code: "invalid"};
  let snapshot;
  try {
    snapshot = await readSnapshot(parsed.data.id, parsed.data.token);
  } catch {
    return {status: "error", code: "unavailable"};
  }
  if (!snapshot) return {status: "error", code: "missing"};
  try {
    const locale = await getLocale() === "en" ? "en" : "tr";
    const content = cardContent(snapshot.report, locale);
    if (!content) return {status: "error", code: "incomplete"};
    const png = await cachedCard("snapshot", snapshot.id, snapshot.expiresAt, locale, parsed.data.format, content);
    if (Date.parse(snapshot.expiresAt) <= Date.now()) return {status: "error", code: "missing"};
    return {status: "success", png: Buffer.from(png).toString("base64"), format: parsed.data.format,
      locale, ...cardFormats[parsed.data.format]};
  } catch (error) {
    return {status: "error", code: error instanceof StorageError ? "unavailable" : "render"};
  }
}
