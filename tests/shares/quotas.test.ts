import {jar} from "../security/cookie-jar";
vi.mock("next/headers", () => ({cookies: async () => jar}));
import {beforeEach,expect,it,vi} from "vitest";
import {limitRequest,requestFailure} from "../../src/lib/security/requests";
import {consumeRateLimit} from "../../src/lib/db/rate-limits";
vi.mock("../../src/lib/db/rate-limits",()=>({consumeRateLimit:vi.fn()}));
beforeEach(()=>{
 vi.useFakeTimers();vi.setSystemTime(new Date("2026-11-17T13:00:00Z"));vi.stubEnv("NODE_ENV","development");vi.stubEnv("SIGNING_SECRET","synthetic-key-with-at-least-32-bytes");
 const counts=new Map<string,number>();
 vi.mocked(consumeRateLimit).mockReset().mockImplementation(async input=>{
  const value=input as {key:string;limit:number;windowMs:number};const count=counts.get(value.key)??0;const allowed=count<value.limit;
  if(allowed)counts.set(value.key,count+1);
  const resetAt=new Date(Date.now()+value.windowMs).toISOString();
  return allowed ? {allowed:true,remaining:value.limit-count-1,resetAt,retryAt:null} : {allowed:false,remaining:0,resetAt,retryAt:resetAt};
 });
});
it("keeps three independent 60/minute private-read, public-read and mutation counters; a new window restores them",async()=>{
 const operations=["report","shareRead","shareMutation"] as const;
 for(const operation of operations){
  for(let n=0;n<60;n++)await limitRequest(operation);
  const failure=await limitRequest(operation).catch(requestFailure);expect(failure).toMatchObject({code:"rateLimit",retryAt:"2026-11-17T13:01:00.000Z"});
 }
 const keys=new Set(vi.mocked(consumeRateLimit).mock.calls.slice(0,183).map(([input])=>(input as {key:string}).key));expect(keys.size).toBe(3);
 vi.advanceTimersByTime(60000);for(const operation of operations)await expect(limitRequest(operation)).resolves.toBeUndefined();
});
