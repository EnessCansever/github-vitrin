import {renderToStaticMarkup} from "react-dom/server";
import {expect,it,vi} from "vitest";
import {LocaleSwitch} from "../../src/components/locale-switch";
const state=vi.hoisted(()=>({path:"/",query:""}));
vi.mock("next/navigation",()=>({usePathname:()=>state.path,useSearchParams:()=>new URLSearchParams(state.query)}));
vi.mock("../../src/i18n/actions",()=>({setLocale:async()=>{}}));
it.each([["lang=en","en"],["lang=tr","tr"],["lang=en&lang=tr","tr"]])("keeps public header language consistent with metadata for %s",(query,selected)=>{
 state.path=`/share/${"a".repeat(48)}`;state.query=query;
 const html=renderToStaticMarkup(<LocaleSwitch locale="en" label="Language"/>);
 expect(html).toContain(`lang="${selected}" aria-pressed="true"`);expect(html).toContain('name="shareId"');
});
it("keeps private/management locale behavior without adding public redirects or fragment data",()=>{
 state.path="/share/manage";state.query="";const html=renderToStaticMarkup(<LocaleSwitch locale="en" label="Language"/>);
 expect(html).toContain('lang="en" aria-pressed="true"');expect(html).not.toContain('name="shareId"');
});
