import {beforeEach, expect, it, vi} from "vitest";
import {publishShare,changeShare} from "../../src/features/shares/actions";
import {readSnapshot} from "../../src/lib/db/snapshots";
import {createShare,manageShare} from "../../src/lib/db/share-reports";
import {reportSchema} from "../../src/lib/db/snapshot-schema";
import {shareOriginAllowed} from "../../src/lib/security/share-origin";
import {limitRequest,requestFailure} from "../../src/lib/security/requests";
import {report} from "../db/fixtures";
vi.mock("../../src/lib/db/snapshots",()=>({readSnapshot:vi.fn()}));
vi.mock("../../src/lib/db/share-reports",()=>({createShare:vi.fn(),manageShare:vi.fn()}));
vi.mock("../../src/lib/security/share-origin",()=>({shareOriginAllowed:vi.fn()}));
vi.mock("../../src/lib/security/requests",()=>({limitRequest:vi.fn(),requestFailure:vi.fn()}));
const privateAccess={id:"11111111-1111-4111-8111-111111111111",token:"a".repeat(64),consent:true};
const access={id:"b".repeat(48),managementToken:"c".repeat(64),expiresAt:"2027-02-15T13:00:00Z"};
beforeEach(()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date("2026-11-17T13:00:00Z"));
 vi.mocked(shareOriginAllowed).mockReset().mockResolvedValue(true);vi.mocked(limitRequest).mockReset().mockResolvedValue(undefined);vi.mocked(requestFailure).mockReset().mockReturnValue(null);
 vi.mocked(readSnapshot).mockReset().mockResolvedValue({id:privateAccess.id,snapshotVersion:1,selectedRepoIds:[10],scopeHash:"f".repeat(64),createdAt:"2026-11-17T13:00:00Z",expiresAt:"2026-12-17T13:00:00Z",report:reportSchema.parse(report())});
 vi.mocked(createShare).mockReset().mockResolvedValue(access);vi.mocked(manageShare).mockReset().mockResolvedValue(true);
});
it("publishes only explicit consent and a server-loaded private report, never client scores/history",async()=>{
 expect(await publishShare(privateAccess)).toEqual({status:"success",access});
 expect(limitRequest).toHaveBeenCalledExactlyOnceWith("shareMutation");
 expect(readSnapshot).toHaveBeenCalledExactlyOnceWith(privateAccess.id,privateAccess.token);
 expect(createShare).toHaveBeenCalledExactlyOnceWith(reportSchema.parse(report()));expect(fetch).not.toHaveBeenCalled();
});
it.each([{}, {...privateAccess,consent:false},{...privateAccess,score:100},{...privateAccess,history:[]},{...privateAccess,token:"wrong"}])("does not create from invalid, nonconsensual or caller-owned payload",async input=>{
 expect(await publishShare(input)).toEqual({status:"error",code:"invalid"});expect(limitRequest).toHaveBeenCalledExactlyOnceWith("shareMutation");expect(createShare).not.toHaveBeenCalled();expect(readSnapshot).not.toHaveBeenCalled();
});
it("requires a live private report only when creating, while old public access cannot grant management",async()=>{
 vi.mocked(readSnapshot).mockResolvedValue(null);expect(await publishShare(privateAccess)).toEqual({status:"error",code:"missing"});expect(createShare).not.toHaveBeenCalled();
 expect(await changeShare({id:access.id,token:privateAccess.token,action:"reopen"})).toEqual({status:"error",code:"invalid"});
 expect(manageShare).not.toHaveBeenCalled();
});
it.each(["close","delete"] as const)("can %s using the separate management link after private expiry without reading the private report",async action=>{
 vi.setSystemTime(new Date("2026-12-18T13:00:00Z"));vi.mocked(readSnapshot).mockResolvedValue(null);
 expect(await changeShare({id:access.id,token:access.managementToken,action})).toEqual({status:"success",action});
 expect(manageShare).toHaveBeenCalledExactlyOnceWith(access.id,access.managementToken,action);expect(readSnapshot).not.toHaveBeenCalled();
});
it("rejects wrong capability and separates write/read failures from missing",async()=>{
 vi.mocked(manageShare).mockResolvedValue(false);expect(await changeShare({id:access.id,token:"d".repeat(64),action:"delete"})).toEqual({status:"error",code:"missing"});
 vi.mocked(readSnapshot).mockRejectedValue(new Error("sensitive"));expect(await publishShare(privateAccess)).toEqual({status:"error",code:"unavailable"});
 vi.mocked(manageShare).mockRejectedValue(new Error("sensitive"));expect(await changeShare({id:access.id,token:access.managementToken,action:"close"})).toEqual({status:"error",code:"unavailable"});
});
it("rejects missing/mismatched origins before quotas and all data operations",async()=>{
 vi.mocked(shareOriginAllowed).mockResolvedValue(false);
 expect(await publishShare(privateAccess)).toEqual({status:"error",code:"origin"});expect(await changeShare({id:access.id,token:access.managementToken,action:"delete"})).toEqual({status:"error",code:"origin"});
 expect(limitRequest).not.toHaveBeenCalled();expect(createShare).not.toHaveBeenCalled();expect(manageShare).not.toHaveBeenCalled();
});
it.each(["rateLimit","configuration","unavailable"] as const)("stops %s before snapshot or share writes",async code=>{
 vi.mocked(limitRequest).mockRejectedValue(new Error());vi.mocked(requestFailure).mockReturnValue({code,...(code==="rateLimit"?{retryAt:"2026-11-17T13:01:00Z"}:{})});
 expect(await publishShare(privateAccess)).toMatchObject({status:"error",code});expect(await changeShare({id:access.id,token:access.managementToken,action:"close"})).toMatchObject({status:"error",code});
 expect(readSnapshot).not.toHaveBeenCalled();expect(createShare).not.toHaveBeenCalled();expect(manageShare).not.toHaveBeenCalled();
});
