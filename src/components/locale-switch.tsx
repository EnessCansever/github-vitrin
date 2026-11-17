"use client";

import {usePathname, useSearchParams} from "next/navigation";
import {setLocale} from "../i18n/actions";

export function LocaleSwitch({locale,label}:{locale:string;label:string}) {
  const pathname=usePathname(),query=useSearchParams();
  const shareId=/^\/share\/([a-f\d]{48})$/.exec(pathname)?.[1];
  const languages=query.getAll("lang");
  const selected=shareId ? (languages.length===1 && languages[0]==="en"?"en":"tr") : locale;
  return <form action={setLocale}>
    {shareId && <input type="hidden" name="shareId" value={shareId}/>}
    <fieldset className="language-switch"><legend className="sr-only">{label}</legend>
      {(["tr","en"] as const).map(language=><button key={language} name="locale" value={language} type="submit" lang={language} aria-pressed={selected===language}>{language.toUpperCase()}</button>)}
    </fieldset>
  </form>;
}
