import "server-only";
import {createHmac, randomBytes, timingSafeEqual} from "node:crypto";
import {cookies} from "next/headers";

export class SessionRequired extends Error {}

export async function analysisSession(secret: string): Promise<string | null> {
  const jar = await cookies();
  const secure = process.env.NODE_ENV !== "development";
  const name = secure ? "__Host-rv-session" : "rv-session";
  const sign = (id: string) => createHmac("sha256", secret).update("session-v1:" + id).digest();
  const match = /^([0-9a-f]{32})\.([0-9a-f]{64})$/.exec(jar.get(name)?.value ?? "");
  if (match && timingSafeEqual(sign(match[1]), Buffer.from(match[2], "hex"))) return match[1];
  const id = randomBytes(16).toString("hex");
  jar.set(name, id + "." + sign(id).toString("hex"), {httpOnly: true, secure, sameSite: "lax", path: "/"});
  return null;
}
