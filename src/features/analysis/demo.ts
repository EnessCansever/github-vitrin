type CheckRule = "bio" | "website" | "profileReadme" | "description" | "topics" | "demo" | "image" | "readme" | "purpose" | "install" | "usage" | "technology" | "features";

type DemoCheck = {
  id: string;
  scope: string;
  rule: CheckRule;
  status: "pass" | "fail";
  earned: number;
  max: number;
};

type DemoCategory = {
  id: "profile" | "projects" | "readme";
  score: number;
  max: number;
  scopes: { name: string; score: number; checks: DemoCheck[] }[];
};

type DemoReport = {
  username: string;
  initials: string;
  rulesVersion: string;
  score: number;
  repoCount: number;
  firstRepo: string;
  secondRepo: string;
  categories: DemoCategory[];
  findings: { repo: string; rule: CheckRule; message: string; detail: string }[];
};

export const demo = {
  "username": "mira-sample",
  "initials": "MS",
  "rulesVersion": "1.0.0",
  "score": 77.5,
  "repoCount": 2,
  "firstRepo": "paper-lantern",
  "secondRepo": "quiet-orbit",
  "categories": [
    {
      "id": "profile",
      "score": 15,
      "max": 20,
      "scopes": [
        {
          "name": "mira-sample",
          "score": 15,
          "checks": [
            { "id": "mira-sample:bio", "scope": "mira-sample", "rule": "bio", "status": "pass", "earned": 5, "max": 5 },
            { "id": "mira-sample:website", "scope": "mira-sample", "rule": "website", "status": "fail", "earned": 0, "max": 5 },
            { "id": "mira-sample:profileReadme", "scope": "mira-sample", "rule": "profileReadme", "status": "pass", "earned": 10, "max": 10 }
          ]
        }
      ]
    },
    {
      "id": "projects",
      "score": 22.5,
      "max": 30,
      "scopes": [
        {
          "name": "paper-lantern",
          "score": 15,
          "checks": [
            { "id": "paper-lantern:description", "scope": "paper-lantern", "rule": "description", "status": "pass", "earned": 10, "max": 10 },
            { "id": "paper-lantern:topics", "scope": "paper-lantern", "rule": "topics", "status": "pass", "earned": 5, "max": 5 },
            { "id": "paper-lantern:demo", "scope": "paper-lantern", "rule": "demo", "status": "fail", "earned": 0, "max": 10 },
            { "id": "paper-lantern:image", "scope": "paper-lantern", "rule": "image", "status": "fail", "earned": 0, "max": 5 }
          ]
        },
        {
          "name": "quiet-orbit",
          "score": 30,
          "checks": [
            { "id": "quiet-orbit:description", "scope": "quiet-orbit", "rule": "description", "status": "pass", "earned": 10, "max": 10 },
            { "id": "quiet-orbit:topics", "scope": "quiet-orbit", "rule": "topics", "status": "pass", "earned": 5, "max": 5 },
            { "id": "quiet-orbit:demo", "scope": "quiet-orbit", "rule": "demo", "status": "pass", "earned": 10, "max": 10 },
            { "id": "quiet-orbit:image", "scope": "quiet-orbit", "rule": "image", "status": "pass", "earned": 5, "max": 5 }
          ]
        }
      ]
    },
    {
      "id": "readme",
      "score": 40,
      "max": 50,
      "scopes": [
        {
          "name": "paper-lantern",
          "score": 50,
          "checks": [
            { "id": "paper-lantern:readme", "scope": "paper-lantern", "rule": "readme", "status": "pass", "earned": 10, "max": 10 },
            { "id": "paper-lantern:purpose", "scope": "paper-lantern", "rule": "purpose", "status": "pass", "earned": 10, "max": 10 },
            { "id": "paper-lantern:install", "scope": "paper-lantern", "rule": "install", "status": "pass", "earned": 10, "max": 10 },
            { "id": "paper-lantern:usage", "scope": "paper-lantern", "rule": "usage", "status": "pass", "earned": 10, "max": 10 },
            { "id": "paper-lantern:technology", "scope": "paper-lantern", "rule": "technology", "status": "pass", "earned": 5, "max": 5 },
            { "id": "paper-lantern:features", "scope": "paper-lantern", "rule": "features", "status": "pass", "earned": 5, "max": 5 }
          ]
        },
        {
          "name": "quiet-orbit",
          "score": 30,
          "checks": [
            { "id": "quiet-orbit:readme", "scope": "quiet-orbit", "rule": "readme", "status": "pass", "earned": 10, "max": 10 },
            { "id": "quiet-orbit:purpose", "scope": "quiet-orbit", "rule": "purpose", "status": "pass", "earned": 10, "max": 10 },
            { "id": "quiet-orbit:install", "scope": "quiet-orbit", "rule": "install", "status": "fail", "earned": 0, "max": 10 },
            { "id": "quiet-orbit:usage", "scope": "quiet-orbit", "rule": "usage", "status": "fail", "earned": 0, "max": 10 },
            { "id": "quiet-orbit:technology", "scope": "quiet-orbit", "rule": "technology", "status": "pass", "earned": 5, "max": 5 },
            { "id": "quiet-orbit:features", "scope": "quiet-orbit", "rule": "features", "status": "pass", "earned": 5, "max": 5 }
          ]
        }
      ]
    }
  ],
  "findings": [
    {
      "repo": "paper-lantern",
      "rule": "demo",
      "message": "demoMissing",
      "detail": "demoDetails"
    },
    {
      "repo": "quiet-orbit",
      "rule": "install",
      "message": "installMissing",
      "detail": "installDetails"
    }
  ]
} satisfies DemoReport;
