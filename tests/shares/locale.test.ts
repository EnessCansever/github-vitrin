import {beforeEach,expect,it,vi} from "vitest";
import {setLocale} from "../../src/i18n/actions";
import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
const set=vi.hoisted(()=>vi.fn());
vi.mock("next/headers",()=>({cookies:async()=>({set})}));
vi.mock("next/navigation",()=>({redirect:vi.fn()}));
vi.mock("next/cache",()=>({revalidatePath:vi.fn()}));
beforeEach(()=>{set.mockClear();vi.mocked(redirect).mockClear();vi.mocked(revalidatePath).mockClear();});
it.each(["tr","en"])("persists %s and redirects only to a validated same-site public share with explicit language",async locale=>{
 const data=new FormData();data.set("locale",locale);data.set("shareId","a".repeat(48));await setLocale(data);
 expect(set).toHaveBeenCalledWith("locale",locale,expect.any(Object));expect(redirect).toHaveBeenCalledWith(`/share/${"a".repeat(48)}?lang=${locale}`);
});
it("preserves private/management page revalidation without redirects or token parameters",async()=>{
 for(const id of ["","https://other.example","manage","a".repeat(48)+"#token=secret"]){const data=new FormData();data.set("locale","en");data.set("shareId",id);await setLocale(data);}
 expect(redirect).not.toHaveBeenCalled();expect(revalidatePath).toHaveBeenCalledWith("/","layout");
});
