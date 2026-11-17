import "server-only";

import {headers} from "next/headers";

export async function shareOriginAllowed(): Promise<boolean> {
  const request = await headers();
  const value = request.get("origin");
  const host = request.get("host");
  if (!value || !host) return false;
  try {
    const origin = new URL(value);
    return origin.origin === value && origin.host === host &&
      (origin.protocol === "https:" || (process.env.NODE_ENV === "development" && origin.protocol === "http:"));
  } catch {
    return false;
  }
}
