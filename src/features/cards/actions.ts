"use server";

import {getLocale} from "next-intl/server";
import {z} from "zod";
import {readSnapshot} from "../../lib/db/snapshots";
import {readToken, snapshotId} from "../../lib/db/snapshot-schema";
import {cardContent} from "./content";
import {renderCard} from "./image";
import {cardFormats, type CardResponse} from "./types";

const inputSchema = z.strictObject({id: snapshotId, token: readToken, format: z.enum(["story", "landscape"])});

export async function generateCard(input: unknown): Promise<CardResponse> {
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
    const png = await renderCard(content, parsed.data.format);
    return {status: "success", png: Buffer.from(png).toString("base64"), format: parsed.data.format,
      locale, ...cardFormats[parsed.data.format]};
  } catch {
    return {status: "error", code: "render"};
  }
}
