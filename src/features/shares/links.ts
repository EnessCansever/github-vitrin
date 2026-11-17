import {z} from "zod";
import type {ShareAccess} from "./types";

const accessSchema = z.strictObject({id:z.string().regex(/^[a-f\d]{48}$/),managementToken:z.string().regex(/^[a-f\d]{64}$/),expiresAt:z.iso.datetime()});
export const managementKey = (id:string) => `repovitrin.share.${id}`;
export const sourceKey = (id:string) => `repovitrin.share.source.${id}`;
export const shareHref = (id:string) => `/share/${id}`;
export const managementHref = (access:ShareAccess) => `/share/manage#id=${access.id}&token=${access.managementToken}`;

export function savedShare(value:string | null): ShareAccess | null {
  if (!value || value.length > 1024) return null;
  try {const parsed=accessSchema.safeParse(JSON.parse(value));return parsed.success ? parsed.data : null;} catch {return null;}
}

export function managementAccess(hash:string): {id:string; token:string} | null {
  const values = new URLSearchParams(hash.replace(/^#/,""));
  const id = z.string().regex(/^[a-f\d]{48}$/).safeParse(values.get("id"));
  const token = z.string().regex(/^[a-f\d]{64}$/).safeParse(values.get("token"));
  return values.size === 2 && id.success && token.success ? {id:id.data,token:token.data} : null;
}
