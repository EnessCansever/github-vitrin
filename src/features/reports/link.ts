import type {SnapshotAccess} from "../analysis/report";

export function reportHref(access: SnapshotAccess): string {
  return `/reports/${access.id}#token=${access.readToken}`;
}
