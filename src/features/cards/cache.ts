import "server-only";

import {createHash} from "node:crypto";
import {Binary} from "mongodb";
import {dbMaxTimeMs, dbWriteConcern, getDatabase} from "../../lib/db/client";
import {StorageError} from "../../lib/db/errors";
import {renderCard} from "./image";
import type {CardContent, ProgressContent, CardFormat} from "./types";

type ImageRecord = {_id: string; expiresAt: Date; png: Binary};

export async function cachedCard(source: "snapshot" | "share" | "comparison", id: string | readonly [string, string], expiry: string,
  locale: "tr" | "en", format: CardFormat, content: CardContent | ProgressContent): Promise<ArrayBuffer> {
  const templateVersion = source === "comparison" && format === "story" ? 2 : 1;
  const key = createHash("sha256")
    .update(JSON.stringify([source, id, templateVersion, locale, format, content])).digest("hex");
  const expiresAt = new Date(expiry);
  const options = {maxTimeMS: dbMaxTimeMs};
  const images = (await getDatabase()).collection<ImageRecord>("cardImages");
  try {
    const hit = await images.findOne({_id: key, expiresAt: {$gt: new Date()}}, options);
    if (hit) return Uint8Array.from(hit.png.value()).buffer;
  } catch {
    throw new StorageError("unavailable");
  }
  const png = await renderCard(content, format);
  try {
    const write = {...options, writeConcern: dbWriteConcern};
    await images.createIndex({expiresAt: 1}, {expireAfterSeconds: 0, name: "card_expiry"}, write);
    await images.updateOne({_id: key}, {$set: {png: new Binary(new Uint8Array(png)), expiresAt}}, {...write, upsert: true});
  } catch {
    throw new StorageError("unavailable");
  }
  return png;
}
