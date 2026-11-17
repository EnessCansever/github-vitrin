import {z} from "zod";
import type {SnapshotAccess} from "../analysis/report";

const entry = z.strictObject({
  id: z.uuid(), readToken: z.string().regex(/^[a-f\d]{64}$/),
  login: z.string().min(1).max(39), checkedAt: z.iso.datetime(), expiresAt: z.iso.datetime(),
});
export type HistoryEntry = z.infer<typeof entry>;
export const HISTORY_KEY = "repovitrin.reports.v1";

export function reportHistory(raw: string | null, now: number): HistoryEntry[] {
  if (!raw || raw.length > 20_000) return [];
  try {
    const parsed = z.array(entry).max(10).safeParse(JSON.parse(raw));
    if (!parsed.success) return [];
    return parsed.data.filter((value, index, values) => Date.parse(value.expiresAt) > now && values.findIndex(other => other.id === value.id) === index);
  } catch {
    return [];
  }
}

export function rememberReport(history: HistoryEntry[], value: HistoryEntry): HistoryEntry[] {
  return [value, ...history.filter(item => item.id !== value.id)].slice(0, 10);
}

export function parseReportLink(value: string, origin: string): SnapshotAccess | null {
  if (value.length > 2048) return null;
  try {
    const url = new URL(value.trim(), origin);
    const match = /^\/reports\/([^/]+)$/.exec(url.pathname);
    const params = new URLSearchParams(url.hash.slice(1));
    const id = z.uuid().safeParse(match?.[1]);
    const token = z.string().regex(/^[a-f\d]{64}$/).safeParse(params.get("token"));
    if (url.origin !== origin || url.username || url.password || url.search || params.size !== 1 || !id.success || !token.success) return null;
    return {id: id.data, readToken: token.data};
  } catch {
    return null;
  }
}
