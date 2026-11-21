"use client";

import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {useLocale, useTranslations} from "next-intl";
import {publishShare} from "./actions";
import {managementHref, managementKey, savedShare, shareHref, sourceKey} from "./links";
import type {ShareAccess, ShareFailure} from "./types";
import {RetryNotice} from "../../components/retry-notice";

export function SharePanel({id}:{id:string}) {
  const t=useTranslations("Sharing");
  const locale=useLocale()==="en"?"en":"tr";
  const [consent,setConsent]=useState(false);
  const [access,setAccess]=useState<ShareAccess | null>(null);
  const [pending,setPending]=useState(false);
  const [failure,setFailure]=useState<ShareFailure | null>(null);
  const [storageFailed,setStorageFailed]=useState(false);
  const [copied,setCopied]=useState<"public" | "management" | null>(null);
  const [manual,setManual]=useState("");
  const busy=useRef(false), version=useRef(0);
  useEffect(()=>{const generation=version;return()=>{generation.current++;};},[]);

  function restore(open:boolean) {
    if(!open || access)return;
    try {
      const shareId=localStorage.getItem(sourceKey(id));
      if(shareId){const value=savedShare(localStorage.getItem(managementKey(shareId)));if(value)setAccess(value);}
    }catch{setStorageFailed(true);}
  }

  async function publish(event:React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if(busy.current || !consent)return;
    busy.current=true;setPending(true);setFailure(null);const current=++version.current;
    const params=new URLSearchParams(window.location.hash.slice(1));
    try {
      const result=await publishShare({id,token:params.size===1?params.get("token")??"":"",consent:true});
      if(current!==version.current)return;
      if(result.status==="error"){setFailure(result);return;}
      setAccess(result.access);
      try {
        localStorage.setItem(managementKey(result.access.id),JSON.stringify(result.access));
        localStorage.setItem(sourceKey(id),result.access.id);
      }catch{setStorageFailed(true);}
    }catch{if(current===version.current)setFailure({status:"error",code:"unavailable"});}
    finally{if(current===version.current){busy.current=false;setPending(false);}}
  }

  async function copy(kind:"public" | "management") {
    if(!access)return;
    const url=new URL(kind==="public"?shareHref(access.id,locale):managementHref(access),window.location.origin).href;
    setCopied(null);setManual("");
    try{await navigator.clipboard.writeText(url);setCopied(kind);}catch{setManual(url);}
  }

  return <details id="share-report" className="comparison-panel" onToggle={event=>restore(event.currentTarget.open)}>
    <summary>{t("createTitle")}</summary>
    <p>{t("createIntro")}</p><p className="small muted">{t("fieldsNote")}</p>
    {!access ? <form onSubmit={publish} aria-busy={pending}>
      <label className="share-consent"><input type="checkbox" checked={consent} onChange={event=>setConsent(event.target.checked)} disabled={pending}/><span>{t("consent")}</span></label>
      <button type="submit" className="button button-primary" disabled={!consent || pending}>{t(pending?"creating":"create")}</button>
    </form> : <>
      <p role="status">{t("created")}</p>
      <div className="report-actions">
        <Link className="button button-secondary" href={shareHref(access.id,locale)} prefetch={false}>{t("openPublic")}</Link>
        <button type="button" className="button button-secondary" onClick={()=>void copy("public")}>{t("copyPublic")}</button>
        <button type="button" className="text-link" onClick={()=>void copy("management")}>{t("copyManagement")}</button>
        <Link className="text-link" href={managementHref(access)} prefetch={false}>{t("manage")}</Link>
      </div>
      <p className="small muted">{t("managementNote")}</p>
      <p className="small muted">{t("previewCacheNotice")}</p>
      <button type="button" className="text-link" onClick={()=>{setAccess(null);setConsent(false);setCopied(null);setManual("");}}>{t("newCopy")}</button>
    </>}
    {storageFailed && <p role="status">{t("storageFailed")}</p>}
    <p role="status">{pending?t("creating"):copied?t(copied==="public"?"copiedPublic":"copiedManagement"):""}</p>
    {manual && <div className="manual-copy"><label htmlFor="share-copy-link">{t("manualCopy")}</label><input id="share-copy-link" readOnly value={manual} onFocus={event=>event.currentTarget.select()}/></div>}
    {failure && <><p role="alert">{t(`errors.${failure.code}`)}</p><RetryNotice retryAt={failure.retryAt}/></>}
  </details>;
}
