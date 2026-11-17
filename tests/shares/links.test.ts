import {expect,it} from "vitest";
import {managementAccess,managementHref,shareHref,savedShare} from "../../src/features/shares/links";
const access={id:"a".repeat(48),managementToken:"b".repeat(64),expiresAt:"2027-02-15T13:00:00Z"};
it("separates readonly public and fragment-only management capabilities",()=>{
 const publicUrl=new URL(shareHref(access.id),"https://example.org");const managerUrl=new URL(managementHref(access),publicUrl.origin);
 expect(publicUrl.hash).toBe("");expect(publicUrl.href).not.toContain(access.managementToken);expect(managerUrl.pathname).toBe("/share/manage");expect(managerUrl.search).toBe("");
 expect(managementAccess(managerUrl.hash)).toEqual({id:access.id,token:access.managementToken});expect(managementAccess(managerUrl.hash+"&extra=1")).toBeNull();expect(managementAccess("#id="+access.id)).toBeNull();
 expect(savedShare(JSON.stringify(access))).toEqual(access);expect(savedShare(JSON.stringify({...access,privateToken:"forbidden"}))).toBeNull();
});
