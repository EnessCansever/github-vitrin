"use client";

import {useEffect, useRef, useState, useSyncExternalStore} from "react";
import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {changeShare} from "./actions";
import {managementAccess, managementKey, shareHref} from "./links";
import type {ShareFailure} from "./types";
import {RetryNotice} from "../../components/retry-notice";

function subscribe(onChange:()=>void){window.addEventListener("hashchange",onChange);return()=>window.removeEventListener("hashchange",onChange);}

export function ShareManager() {
  const t=useTranslations("Sharing");
  const hash=useSyncExternalStore(subscribe,()=>window.location.hash,()=>"");
  const access=managementAccess(hash);
  return access ? <ManageControls key={hash} access={access}/> : <p role="status">{t("managementMissing")}</p>;
}

function ManageControls({access}:{access:{id:string;token:string}}) {
  const t=useTranslations("Sharing");
  const locale=useLocale()==="en"?"en":"tr";
  const [pending,setPending]=useState(false);
  const [storageFailed,setStorageFailed]=useState(false);
  const [result,setResult]=useState<"close" | "delete" | null>(null);
  const [failure,setFailure]=useState<ShareFailure | null>(null);
  const busy=useRef(false),version=useRef(0);
  useEffect(()=>{const generation=version;return()=>{generation.current++;};},[]);

  async function change(action:"close" | "delete") {
    if(busy.current)return;
    busy.current=true;setPending(true);setFailure(null);const current=++version.current;
    try {
      const response=await changeShare({...access,action});
      if(current!==version.current)return;
      if(response.status==="error")setFailure(response);
      else{
        setResult(action);
        if(action==="delete"){try{localStorage.removeItem(managementKey(access.id));}catch{setStorageFailed(true);}}
      }
    }catch{if(current===version.current)setFailure({status:"error",code:"unavailable"});}
    finally{if(current===version.current){busy.current=false;setPending(false);}}
  }

  return <section>
    <p>{t("manageIntro")}</p><p className="small muted">{t("previewCacheNotice")}</p><p className="small muted">{t("manageLifetime")}</p>
    <div className="report-actions">
      <button type="button" className="button button-secondary" disabled={pending || result!==null} onClick={()=>void change("close")}>{t("close")}</button>
      <button type="button" className="button button-secondary" disabled={pending || result==="delete"} onClick={()=>void change("delete")}>{t("delete")}</button>
      {result===null && <Link className="text-link" href={shareHref(access.id,locale)} prefetch={false}>{t("openPublic")}</Link>}
    </div>
    <p role="status">{pending?t("changing"):result?t(result==="close"?"closed":"deleted"):""}</p>
    {failure && <><p role="alert">{t(`errors.${failure.code}`)}</p><RetryNotice retryAt={failure.retryAt}/></>}
    {storageFailed && <p role="status">{t("localCleanupFailed")}</p>}
    <Link className="text-link" href="/">{t("home")}</Link>
  </section>;
}
