import "server-only";

import {cache} from "react";
import type {Metadata} from "next";
import {createTranslator} from "next-intl";
import {publicOrigin} from "../../config/public-url";
import {site} from "../../config/site";
import {loadPublicShare} from "./read";
import {shareHref} from "./links";
import type {PublicShare} from "./types";
import tr from "../../messages/tr.json";
import en from "../../messages/en.json";

// React's cache only deduplicates metadata/page reads within one server render.
export const getSharePage = cache(loadPublicShare);
export const shareLocale = (value:unknown):"tr" | "en" => value==="en"?"en":"tr";

export function shareMetadata(share:PublicShare | null, locale:"tr" | "en"): Metadata {
  const t=createTranslator({locale,messages:locale==="tr"?tr:en});
  const generic={title:t("Preview.unavailableTitle",{brand:site.name}),description:t("Preview.unavailableDescription"),
    robots:{index:false,follow:false,noarchive:true},referrer:"no-referrer" as const,
    openGraph:{title:t("Preview.unavailableTitle",{brand:site.name}),description:t("Preview.unavailableDescription"),images:[]},
    twitter:{card:"summary" as const,title:t("Preview.unavailableTitle",{brand:site.name}),description:t("Preview.unavailableDescription"),images:[]}};
  if(!share)return generic;
  const value=share.summary;
  if(value.status!=="complete" || value.score===null || !value.profileType) return {...generic,title:t("Preview.incompleteTitle",{brand:site.name}),description:t("Preview.incompleteDescription"),
    openGraph:{title:t("Preview.incompleteTitle",{brand:site.name}),description:t("Preview.incompleteDescription"),images:[]},
    twitter:{card:"summary",title:t("Preview.incompleteTitle",{brand:site.name}),description:t("Preview.incompleteDescription"),images:[]}};
  let origin;
  try{origin=publicOrigin();}catch{return generic;}
  const score=new Intl.NumberFormat(locale,{maximumFractionDigits:1}).format(value.score);
  const type=t(`Report.types.${value.profileType}.title`);
  const title=t("Preview.title",{brand:site.name,username:value.profile.login,score,type});
  const description=t("Preview.description",{username:value.profile.login,score,type});
  const url=new URL(shareHref(share.id,locale),origin).href;
  const image=new URL(`/share/${share.id}/image/${locale}`,origin).href;
  const alt=t("Preview.alt",{username:value.profile.login,score,type});
  return {title,description,robots:generic.robots,referrer:generic.referrer,
    alternates:{canonical:url,languages:{tr:new URL(shareHref(share.id,"tr"),origin).href,en:new URL(shareHref(share.id,"en"),origin).href}},
    openGraph:{type:"website",siteName:site.name,locale:locale==="tr"?"tr_TR":"en_US",title,description,url,images:[{url:image,width:1200,height:630,type:"image/png",alt}]},
    twitter:{card:"summary_large_image",title,description,images:[{url:image,alt}]}};
}
