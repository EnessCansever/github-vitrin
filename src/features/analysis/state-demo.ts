export type StateExample = {
  id: "loading" | "notFound" | "empty" | "network" | "rateLimit" | "partial";
  actionHref: string;
  knownFinding?: { repo: string; messageKey: string };
};

export const stateExamples: StateExample[] = [
  { id: "loading", actionHref: "/demo/select" },
  { id: "notFound", actionHref: "/#github-profile" },
  { id: "empty", actionHref: "/#github-profile" },
  { id: "network", actionHref: "/demo/select" },
  { id: "rateLimit", actionHref: "/demo/select" },
  {
    id: "partial",
    actionHref: "/demo/select",
    knownFinding: { repo: "paper-lantern", messageKey: "knownDescription" },
  },
];
