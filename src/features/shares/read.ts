import "server-only";

import {readShare} from "../../lib/db/share-reports";
import {limitRequest, requestFailure} from "../../lib/security/requests";
import type {PublicShare, ShareFailure} from "./types";

export async function loadPublicShare(id: unknown): Promise<{status:"success"; share:PublicShare} | ShareFailure> {
  try {await limitRequest("shareRead");} catch (error) {
    return {status:"error", ...(requestFailure(error) ?? {code:"unavailable" as const})};
  }
  try {
    const share = await readShare(id);
    return share ? {status:"success",share} : {status:"error",code:"missing"};
  } catch {
    return {status:"error",code:"unavailable"};
  }
}
