import "server-only";

import {createHmac} from "node:crypto";
import {isIP} from "node:net";
import {headers} from "next/headers";
import {requestLimits, analysisRefresh} from "../../config/request-limits";
import {consumeRateLimit} from "../db/rate-limits";
import {StorageError} from "../db/errors";

class RequestError extends Error {
  constructor(readonly code: "rateLimit" | "configuration" | "unavailable", readonly retryAt?: string) {
    super(code);
    this.name = "RequestError";
  }
}

function secret(): string {
  const value = process.env.SIGNING_SECRET;
  if (!value?.trim() || Buffer.byteLength(value, "utf8") < 32) throw new RequestError("configuration");
  return value;
}

async function consume(key: string, policy: {limit: number; windowMs: number}, windowEnd?: number) {
  try {
    const result = await consumeRateLimit({key, ...policy});
    if (!result.allowed) {
      const retryAt = windowEnd === undefined ? result.retryAt
        : new Date(Math.min(Date.parse(result.retryAt), windowEnd)).toISOString();
      throw new RequestError("rateLimit", retryAt);
    }
  } catch (error) {
    if (error instanceof RequestError) throw error;
    throw new RequestError(error instanceof StorageError && error.code === "configuration" ? "configuration" : "unavailable");
  }
}

export async function limitRequest(operation: keyof typeof requestLimits): Promise<void> {
  const signingSecret = secret();
  let identity: string;
  if (process.env.NODE_ENV === "development") {
    identity = "local-development";
  } else {
    if (process.env.VERCEL !== "1" || !["preview", "production"].includes(process.env.VERCEL_ENV ?? "")) {
      throw new RequestError("configuration");
    }
    const ip = (await headers()).get("x-vercel-forwarded-for");
    if (!ip || !isIP(ip)) throw new RequestError("configuration");
    identity = isIP(ip) === 6 ? new URL(`http://[${ip}]`).hostname : ip;
  }
  const policy = requestLimits[operation];
  const period = Math.floor(Date.now() / policy.windowMs);
  const key = createHmac("sha256", signingSecret).update(JSON.stringify(["request-v1", operation, period, identity])).digest("hex");
  // IP keys rotate per policy window; the separate analysis cooldown does not rotate.
  await consume(key, policy, (period + 1) * policy.windowMs);
}

export async function limitAnalysis(scope: string): Promise<void> {
  const key = createHmac("sha256", secret()).update(JSON.stringify([
    "analysis-refresh-v2", scope,
  ])).digest("hex");
  await consume(key, analysisRefresh);
}

export function requestFailure(error: unknown) {
  if (!(error instanceof RequestError)) return null;
  return error.retryAt ? {code: error.code, retryAt: error.retryAt} : {code: error.code};
}
