import {beforeEach, expect, it, vi} from "vitest";
import {loadPublicShare} from "../../src/features/shares/read";
import {readShare} from "../../src/lib/db/share-reports";
import {limitRequest, requestFailure} from "../../src/lib/security/requests";
import {shareSummary} from "../../src/lib/db/share-schema";
import {report} from "../db/fixtures";
vi.mock("../../src/lib/db/share-reports", () => ({readShare:vi.fn()}));
vi.mock("../../src/lib/security/requests", () => ({limitRequest:vi.fn(),requestFailure:vi.fn()}));
const id="a".repeat(48);
beforeEach(()=>{vi.mocked(readShare).mockReset();vi.mocked(limitRequest).mockReset().mockResolvedValue(undefined);vi.mocked(requestFailure).mockReset().mockReturnValue(null);});
it("reads only the separate share with one report entry budget and no GitHub or private report access", async()=>{
 const share={id,createdAt:"2026-11-17T13:00:00Z",expiresAt:"2027-02-15T13:00:00Z",summary:shareSummary(report())};
 vi.mocked(readShare).mockResolvedValue(share);
 expect(await loadPublicShare(id)).toEqual({status:"success",share});
 expect(limitRequest).toHaveBeenCalledExactlyOnceWith("shareRead");expect(readShare).toHaveBeenCalledExactlyOnceWith(id);expect(fetch).not.toHaveBeenCalled();
});
it("distinguishes a closed/deleted/expired record from storage failure without raw errors", async()=>{
 vi.mocked(readShare).mockResolvedValue(null);expect(await loadPublicShare(id)).toEqual({status:"error",code:"missing"});
 vi.mocked(readShare).mockRejectedValue(new Error("private diagnostics"));expect(await loadPublicShare(id)).toEqual({status:"error",code:"unavailable"});
});
it.each(["configuration","unavailable","rateLimit"] as const)("stops %s before reading share storage", async code=>{
 vi.mocked(limitRequest).mockRejectedValue(new Error());vi.mocked(requestFailure).mockReturnValue({code,...(code==="rateLimit"?{retryAt:"2026-11-17T13:01:00Z"}:{})});
 expect(await loadPublicShare(id)).toMatchObject({status:"error",code});expect(readShare).not.toHaveBeenCalled();
});
