import {shareImage} from "@/features/shares/og-image";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(_request:Request,{params}:{params:Promise<{id:string;locale:string}>}){
  const {id,locale}=await params;
  return shareImage(id,locale);
}
