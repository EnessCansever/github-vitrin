"use client";

import {useEffect, useRef, useState} from "react";
import Image from "next/image";
import {ImageDown} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import {site} from "../../config/site";
import {generateCard} from "./actions";
import {cardFormats, type CardFormat, type CardResponse} from "./types";

export function CardStudio({id, complete}: {id: string; complete: boolean}) {
  const t = useTranslations("Card");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<CardFormat>("story");
  const [preview, setPreview] = useState<{key: string; response: CardResponse} | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [requested, setRequested] = useState<string | null>(null);
  const request = useRef<{key: string; promise: Promise<CardResponse>} | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const key = `${id}:${format}:${locale}:${attempt}`;
  const response = preview?.key === key ? preview.response : null;
  const pending = open && response === null;

  useEffect(() => {
    if (!open || !complete) return;
    let active = true;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.size === 1 ? params.get("token") ?? "" : "";
    const requestKey = `${key}:${token}`;
    if (!request.current || request.current.key !== requestKey) {
      request.current = {key: requestKey, promise: generateCard({id, token, format}).catch(() => ({status: "error", code: "unavailable"}))};
    }
    void request.current.promise.then(result => {
      if (!active) return;
      setPreview({key, response: result.status === "success" && result.locale !== locale ? {status: "error", code: "render"} : result});
    });
    return () => {active = false;};
  }, [open, complete, id, format, locale, key]);

  useEffect(() => {if (open) heading.current?.focus({preventScroll: true});}, [open]);

  return (
    <div className="card-studio">
      <button type="button" className={`button ${complete ? "button-secondary" : "button-disabled"}`} disabled={!complete || pending} aria-expanded={open} aria-controls="card-preview-panel"
        aria-describedby={!complete ? "card-incomplete" : undefined} onClick={() => setOpen(value => !value)}>
        <ImageDown size={17} aria-hidden="true" />{t(open ? "close" : "title")}
      </button>
      {!complete && <p id="card-incomplete" className="small muted">{t("incomplete")}</p>}
      {open && (
        <section id="card-preview-panel" aria-labelledby="card-preview-title" className="card-preview-panel" aria-busy={pending}>
          <h2 ref={heading} id="card-preview-title" tabIndex={-1}>{t("title")}</h2>
          <p className="small muted">{t("intro")}</p>
          <fieldset className="card-formats" disabled={pending}>
            <legend>{t("format")}</legend>
            {(Object.keys(cardFormats) as CardFormat[]).map(value => (
              <label key={value}><input type="radio" name="card-format" value={value} checked={format === value} onChange={() => setFormat(value)} />{t(value)}</label>
            ))}
          </fieldset>
          <p role="status" className="small">{pending ? t("pending") : requested === key ? t("downloadRequested") : ""}</p>
          {response?.status === "error" && (
            <div role="alert"><p>{t(`errors.${response.code}`)}</p><button type="button" className="button button-secondary" onClick={() => setAttempt(value => value + 1)}>{t("retry")}</button></div>
          )}
          {response?.status === "success" && (
            <>
              <Image className={`card-preview-image card-preview-image--${response.format}`} src={`data:image/png;base64,${response.png}`} alt={t("previewAlt", {format: t(response.format)})}
                width={response.width} height={response.height} unoptimized />
              <a className="button button-primary" href={`data:image/png;base64,${response.png}`} download={`${site.name.toLowerCase()}-${response.format}-${response.locale}.png`}
                onClick={() => setRequested(key)}>{t("download")}</a>
            </>
          )}
        </section>
      )}
    </div>
  );
}
