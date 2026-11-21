import "server-only";

import {createHmac} from "node:crypto";
import {isIP} from "node:net";
import {analysisSession, SessionRequired} from "./session";
import {headers} from "next/headers";
import {requestLimits, analysisRefresh} from "../../config/request-limits";
import {consumeRateLimit, type CounterStage} from "../db/rate-limits";
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

type AdmissionStage = CounterStage | "signing_secret" | "platform" | "trusted_ip" | "session" | "quota_input";
type ObserveAdmission = (stage: AdmissionStage, category?: string) => void;

async function consume(key: string, policy: {limit: number; windowMs: number}, windowEnd?: number, observe?: ObserveAdmission) {
  let stage: CounterStage | "quota_input" = "quota_input";
  try {
    observe?.(stage);
    const result = await consumeRateLimit({key, ...policy}, observe && (step => {stage = step; observe(step);}));
    if (!result.allowed) {
      const retryAt = windowEnd === undefined ? result.retryAt
        : new Date(Math.min(Date.parse(result.retryAt), windowEnd)).toISOString();
      throw new RequestError("rateLimit", retryAt);
    }
  } catch (error) {
    if (error instanceof RequestError) throw error;
    observe?.(stage, error instanceof StorageError ? error.diagnostic ?? error.code : "unexpected");
    throw new RequestError(error instanceof StorageError && error.code === "configuration" ? "configuration" : "unavailable");
  }
}

export async function limitRequest(operation: keyof typeof requestLimits, observe?: ObserveAdmission): Promise<void> {
  observe?.("signing_secret");
  const signingSecret = secret();
  let identity: string;
  if (process.env.NODE_ENV === "development") {
    identity = "local-development";
  } else {
    observe?.("platform");
    if (process.env.VERCEL !== "1" || !["preview", "production"].includes(process.env.VERCEL_ENV ?? "")) {
      throw new RequestError("configuration");
    }
    observe?.("trusted_ip");
    const ip = (await headers()).get("x-vercel-forwarded-for");
    if (!ip || !isIP(ip)) throw new RequestError("configuration");
    identity = isIP(ip) === 6 ? new URL(`http://[${ip}]`).hostname : ip;
  }
  const policy = requestLimits[operation];
  const period = Math.floor(Date.now() / policy.windowMs);
  const key = createHmac("sha256", signingSecret).update(JSON.stringify(["request-v1", operation, period, identity])).digest("hex");
  // IP keys rotate per policy window; the separate analysis cooldown does not rotate.
  await consume(key, policy, (period + 1) * policy.windowMs, observe);
  if (operation === "search" || operation === "report" || operation === "analysis") {
    observe?.("session");
    const session = await analysisSession(signingSecret);
    if (operation === "analysis") {
      if (!session) throw new SessionRequired();
      const sessionKey = createHmac("sha256", signingSecret)
        .update(JSON.stringify(["session-analysis-v1", period, session])).digest("hex");
      await consume(sessionKey, policy, (period + 1) * policy.windowMs);
    }
  }
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
