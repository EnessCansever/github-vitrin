import {beforeEach,expect,it,vi} from "vitest";
import {publicOrigin} from "../../src/config/public-url";
import {shareLocale,shareMetadata} from "../../src/features/shares/metadata";
import {shareImage} from "../../src/features/shares/og-image";
import {loadPublicShare} from "../../src/features/shares/read";
import {readShare} from "../../src/lib/db/share-reports";
import {renderCard} from "../../src/features/cards/image";
import {cardContent,summaryCardContent} from "../../src/features/cards/content";
import {limitRequest,requestFailure} from "../../src/lib/security/requests";
import {shareSummary} from "../../src/lib/db/share-schema";
import {report} from "../db/fixtures";
import type {PublicShare} from "../../src/features/shares/types";

vi.mock("../../src/features/shares/read",()=>({loadPublicShare:vi.fn()}));
vi.mock("../../src/lib/db/share-reports",()=>({readShare:vi.fn()}));
vi.mock("../../src/features/cards/image",()=>({renderCard:vi.fn()}));
vi.mock("../../src/lib/security/requests",()=>({limitRequest:vi.fn(),requestFailure:vi.fn()}));
const id="a".repeat(48);
function share():PublicShare{return {id,createdAt:"2026-11-18T12:00:00Z",expiresAt:"2027-02-16T12:00:00Z",summary:shareSummary(report(3))};}
beforeEach(()=>{
 vi.stubEnv("SITE_URL","https://preview.example.org");vi.stubEnv("NODE_ENV","production");
 vi.mocked(loadPublicShare).mockReset().mockResolvedValue({status:"success",share:share()});
 vi.mocked(readShare).mockReset().mockResolvedValue(share());
 vi.mocked(renderCard).mockReset().mockResolvedValue(new Uint8Array([137,80,78,71]).buffer);
 vi.mocked(limitRequest).mockReset().mockResolvedValue(undefined);vi.mocked(requestFailure).mockReset().mockReturnValue(null);
});

it.each(["tr","en"] as const)("uses only the stored public copy for matching %s metadata/OG data with absolute URLs",async locale=>{
 const value=share(),original=structuredClone(value),metadata=shareMetadata(value,locale),data=summaryCardContent(value.summary,locale);
 expect(metadata.title).toContain(locale==="tr"?"96,7":"96.7");expect(metadata.title).toContain("mira-sample");
 expect(metadata.openGraph).toMatchObject({locale:locale==="tr"?"tr_TR":"en_US",url:`https://preview.example.org/share/${id}?lang=${locale}`,images:[{url:`https://preview.example.org/share/${id}/image/${locale}`,width:1200,height:630}]});
 expect(metadata.twitter).toMatchObject({card:"summary_large_image",title:metadata.title,description:metadata.description});
 expect(data?.score).toBe(locale==="tr"?"96,7":"96.7");
 expect(data).toEqual(cardContent(report(3),locale));expect(value).toEqual(original);
 const response=await shareImage(id,locale);expect(response.status).toBe(200);expect(response.headers.get("content-type")).toBe("image/png");
 expect(renderCard).toHaveBeenCalledExactlyOnceWith(data,"landscape");expect(limitRequest).toHaveBeenCalledExactlyOnceWith("card");
 expect(loadPublicShare).toHaveBeenCalledExactlyOnceWith(id);expect(readShare).toHaveBeenCalledExactlyOnceWith(id);expect(fetch).not.toHaveBeenCalled();
 expect(JSON.stringify(metadata)).not.toMatch(/token|snapshot|history|management/i);
});

it.each(["closed","deleted","expired","missing"])("does not serve report metadata or PNG for %s access",async()=>{
 vi.mocked(loadPublicShare).mockResolvedValue({status:"error",code:"missing"});
 const metadata=shareMetadata(null,"en");expect(JSON.stringify(metadata)).not.toContain("mira-sample");expect(metadata.openGraph).toMatchObject({images:[]});
 const response=await shareImage(id,"en");expect(response.status).toBe(404);expect(await response.json()).toEqual({code:"missing"});
 expect(renderCard).not.toHaveBeenCalled();expect(limitRequest).not.toHaveBeenCalled();
 expect(response.headers.get("cache-control")).toContain("no-store");
});
it("discards rendered bytes if the share closes, expires or disappears during rendering",async()=>{
 vi.mocked(readShare).mockResolvedValue(null);const response=await shareImage(id,"tr");
 expect(renderCard).toHaveBeenCalledOnce();expect(response.status).toBe(404);expect(response.headers.get("content-type")).toContain("json");
});
it("rejects incomplete previews without inventing a score/type or spending render quota",async()=>{
 const value={...share(),summary:shareSummary(report(3,true))};
 vi.mocked(loadPublicShare).mockResolvedValue({status:"success",share:value});
 expect(shareMetadata(value,"tr").title).toBe("Eksik analiz | RepoVitrin");expect(shareMetadata(value,"en").openGraph).toMatchObject({images:[]});
 expect((await shareImage(id,"en")).status).toBe(422);expect(limitRequest).not.toHaveBeenCalled();expect(renderCard).not.toHaveBeenCalled();
});
it("fails closed on DB/config/render failures and carries only real rate-limit retry time",async()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date("2026-11-18T12:00:00Z"));
 vi.mocked(loadPublicShare).mockResolvedValue({status:"error",code:"unavailable"});expect((await shareImage(id,"en")).status).toBe(503);
 vi.mocked(loadPublicShare).mockResolvedValue({status:"error",code:"rateLimit",retryAt:"2026-11-18T12:00:12Z"});
 let response=await shareImage(id,"en");expect(response.status).toBe(429);expect(response.headers.get("retry-after")).toBe("12");
 vi.mocked(loadPublicShare).mockResolvedValue({status:"success",share:share()});vi.mocked(limitRequest).mockRejectedValue(new Error("sensitive"));
 vi.mocked(requestFailure).mockReturnValue({code:"rateLimit",retryAt:"2026-11-18T12:00:30Z"});
 response=await shareImage(id,"en");expect(response.status).toBe(429);expect(response.headers.get("retry-after")).toBe("30");expect(renderCard).not.toHaveBeenCalled();
 vi.mocked(limitRequest).mockResolvedValue(undefined);vi.mocked(renderCard).mockRejectedValue(new Error("sensitive"));
 response=await shareImage(id,"en");expect(await response.json()).toEqual({code:"unavailable"});
});
it("does not use application/CDN caching or ETags for successful or rejected images",async()=>{
 const response=await shareImage(id,"tr");
 for(const header of ["cache-control","cdn-cache-control","vercel-cdn-cache-control"])expect(response.headers.get(header)).toContain("no-store");
 expect(response.headers.get("etag")).toBeNull();expect(response.headers.get("referrer-policy")).toBe("no-referrer");
 expect((await shareImage(id,"unknown")).status).toBe(400);
});
it("takes canonical origin only from explicit configuration, never request host or a guessed final domain",()=>{
 expect(publicOrigin()).toBe("https://preview.example.org");
 for(const value of ["","http://preview.example.org","https://user:secret@preview.example.org","https://preview.example.org/path","https://preview.example.org?token=x","https://preview.example.org#secret"]){
  vi.stubEnv("SITE_URL",value);expect(()=>publicOrigin()).toThrow("site_url_configuration");expect(JSON.stringify(shareMetadata(share(),"en"))).not.toContain("mira-sample");
 }
 vi.stubEnv("NODE_ENV","development");vi.stubEnv("SITE_URL","");expect(publicOrigin()).toBe("http://localhost:3000");
 expect(shareLocale(["en","tr"])).toBe("tr");expect(shareLocale("en")).toBe("en");
});
