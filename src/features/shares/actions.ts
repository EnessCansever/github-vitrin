"use server";

import {z} from "zod";
import {readSnapshot} from "../../lib/db/snapshots";
import {snapshotId, readToken} from "../../lib/db/snapshot-schema";
import {createShare, manageShare} from "../../lib/db/share-reports";
import {shareId, managementToken} from "../../lib/db/share-schema";
import {shareOriginAllowed} from "../../lib/security/share-origin";
import {limitRequest, requestFailure} from "../../lib/security/requests";
import type {ShareAccess, ShareFailure} from "./types";

async function admit(): Promise<ShareFailure | null> {
  try {
    if (!await shareOriginAllowed()) return {status:"error",code:"origin"};
    await limitRequest("shareMutation");
    return null;
  } catch (error) {
    return {status:"error", ...(requestFailure(error) ?? {code:"unavailable" as const})};
  }
}

export async function publishShare(input: unknown): Promise<{status:"success"; access:ShareAccess} | ShareFailure> {
  const failure = await admit();
  if (failure) return failure;
  const parsed = z.strictObject({id:snapshotId,token:readToken,consent:z.literal(true)}).safeParse(input);
  if (!parsed.success) return {status:"error",code:"invalid"};
  try {
    const snapshot = await readSnapshot(parsed.data.id,parsed.data.token);
    if (!snapshot || Date.parse(snapshot.expiresAt) <= Date.now()) return {status:"error",code:"missing"};
    return {status:"success",access:await createShare(snapshot.report)};
  } catch {
    return {status:"error",code:"unavailable"};
  }
}

export async function changeShare(input: unknown): Promise<{status:"success"; action:"close" | "delete"} | ShareFailure> {
  const failure = await admit();
  if (failure) return failure;
  const parsed = z.strictObject({id:shareId,token:managementToken,action:z.enum(["close","delete"])}).safeParse(input);
  if (!parsed.success) return {status:"error",code:"invalid"};
  try {
    const changed = await manageShare(parsed.data.id,parsed.data.token,parsed.data.action);
    return changed ? {status:"success",action:parsed.data.action} : {status:"error",code:"missing"};
  } catch {
    return {status:"error",code:"unavailable"};
  }
}
