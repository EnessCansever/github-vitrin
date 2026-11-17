import {expect, it, vi} from "vitest";
import {headers} from "next/headers";
import {shareOriginAllowed} from "../../src/lib/security/share-origin";
vi.mock("next/headers", () => ({headers:vi.fn()}));
it.each([
  ["https://example.org","example.org",true],
  ["https://other.example","example.org",false],
  [null,"example.org",false],
  ["null","example.org",false],
  ["https://user:pass@example.org","example.org",false],
  ["https://example.org/path","example.org",false],
  ["https://example.org",null,false],
  ["http://example.org","example.org",false],
])("strictly checks share mutation origin without trusting forwarded hosts: %s", async (origin,host,allowed) => {
  vi.stubEnv("NODE_ENV","production");
  const request = new Headers({"x-forwarded-host":"other.example"});
  if(origin)request.set("origin",origin);if(host)request.set("host",host);
  vi.mocked(headers).mockResolvedValue(request);
  expect(await shareOriginAllowed()).toBe(allowed);
});
it("allows same-origin HTTP only in development", async () => {
  vi.stubEnv("NODE_ENV","development");
  vi.mocked(headers).mockResolvedValue(new Headers({origin:"http://localhost:3000",host:"localhost:3000"}));
  expect(await shareOriginAllowed()).toBe(true);
});
