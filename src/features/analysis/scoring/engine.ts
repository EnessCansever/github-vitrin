import type {Readme} from "../../../lib/github/client";
import {loginSchema} from "../../../lib/github/input";
import {repoName} from "../../../lib/github/schemas";
import {httpUrl, inspectMarkdown, type MarkdownSignals} from "./markdown";
import type {
  AnalysisInput, AnalysisResult, Category, CategoryId, Check, CheckStatus, Evidence,
  ProfileType, Recommendation, Rule, Scope,
} from "./types";

export const RULES_VERSION = "1.0.0";
const ruleOrder: Rule[] = ["bio", "website", "profileReadme", "description", "topics", "demo", "image", "readme", "purpose", "install", "usage", "technology", "features"];
const weights: Record<Rule, number> = {
  bio: 5, website: 5, profileReadme: 10, description: 10, topics: 5, demo: 10,
  image: 5, readme: 10, purpose: 10, install: 10, usage: 10, technology: 5, features: 5,
};

export class ScoringError extends Error {
  constructor(readonly code: "no_repos" | "invalid_scope" | "unsupported_rules") {
    super(code);
    this.name = "ScoringError";
  }
}

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function readmeState(readme: Readme): "found" | "missing" | "unknown" {
  if (readme.status === "found" && new TextEncoder().encode(readme.text).length > 256 * 1024) return "unknown";
  return readme.status;
}

function fileEvidence(readme: Readme, fullName: string, checkedAt?: string, id?: number): Evidence {
  const state = readmeState(readme);
  const evidence: Evidence = {
    sourceUrl: `https://github.com/${fullName}`, field: "readme", repo: {id, fullName},
    checkedAt, availability: state, detailKey: `readme.${state}`,
  };
  if (readme.status === "found") {
    evidence.path = readme.path;
    evidence.branch = readme.branch;
    evidence.sha = readme.sha;
    evidence.sourceUrl += `/blob/${encodeURIComponent(readme.branch)}/${readme.path.split("/").map(encodeURIComponent).join("/")}`;
    if (state === "unknown") evidence.errorCode = "too_large";
  } else if (readme.status === "unknown") evidence.errorCode = readme.error.code;
  return evidence;
}

function profileType(checks: Check[], score: number): ProfileType {
  const demos = checks.filter(check => check.rule === "demo");
  const installs = checks.filter(check => check.rule === "install");
  if (score >= 80 && [...demos, ...installs].every(check => check.status === "pass")) {
    return {id: "ready", checkIds: checks.filter(check => check.status === "pass").map(check => check.id)};
  }
  if (demos.every(check => check.status === "fail")) return {id: "noDemo", checkIds: demos.map(check => check.id)};
  const purpose = checks.filter(check => ["description", "purpose"].includes(check.rule));
  const gaps = checks.filter(check => (check.category === "profile" || ["demo", "install"].includes(check.rule)) && check.status === "fail");
  if (purpose.every(check => check.status === "pass") && gaps.length) {
    return {id: "hiddenGem", checkIds: [...purpose, ...gaps].map(check => check.id)};
  }
  return {id: "inProgress", checkIds: checks.filter(check => check.status === "fail").map(check => check.id)};
}

function recommendations(checks: Check[], categories: Category[], repoCount: number): Recommendation[] {
  const emptyReadmes = new Set(checks.filter(check => check.rule === "readme" && check.status === "fail").map(check => check.scope.id));
  return checks.filter(check => check.status === "fail" &&
    !(check.scope.kind === "repo" && emptyReadmes.has(check.scope.id) &&
      !["readme", "description", "topics", "demo"].includes(check.rule)))
    .map(check => {
      const rawImpact = check.max / (check.scope.kind === "repo" ? repoCount : 1);
      const category = categories.find(category => category.id === check.category);
      return {
        checkId: check.id, target: {...check.scope}, suggestionKey: check.suggestionKey,
        rawImpact,
        categoryImpact: category && category.rawScore !== null && category.score !== null
          ? round(round(category.rawScore + rawImpact) - category.score) : null,
      };
    })
    .sort((a, b) => b.rawImpact - a.rawImpact || ruleOrder.indexOf(a.suggestionKey) - ruleOrder.indexOf(b.suggestionKey) || a.target.id - b.target.id)
    .slice(0, 3);
}

export function scoreAnalysis(input: AnalysisInput): AnalysisResult {
  if (input.rulesVersion !== RULES_VERSION) throw new ScoringError("unsupported_rules");
  if (!input.repos.length) throw new ScoringError("no_repos");
  const profile = input.profile;
  const ids = new Set<number>();
  const names = new Set<string>();
  if (input.repos.length > 3 || !Number.isSafeInteger(profile.id) || profile.id <= 0 || !loginSchema.safeParse(profile.login).success) {
    throw new ScoringError("invalid_scope");
  }
  for (const {repo} of input.repos) {
    const name = repo.name.toLowerCase();
    if (!Number.isSafeInteger(repo.id) || repo.id <= 0 || !repoName.safeParse(repo.name).success ||
      ids.has(repo.id) || names.has(name) || repo.isPrivate || repo.isArchived || repo.isFork ||
      repo.owner.type !== "User" || repo.owner.id !== profile.id || repo.owner.login.toLowerCase() !== profile.login.toLowerCase()) {
      throw new ScoringError("invalid_scope");
    }
    ids.add(repo.id);
    names.add(name);
  }
  const checks: Check[] = [];
  function add(rule: Rule, category: CategoryId, scope: Scope, value: boolean | null, evidence: Evidence[]) {
    const status: CheckStatus = value === null ? "unknown" : value ? "pass" : "fail";
    checks.push({
      id: `${scope.kind}:${scope.id}:${rule}`, rulesVersion: RULES_VERSION, rule, category,
      scope: {...scope}, status, earned: value === null ? null : value ? weights[rule] : 0,
      max: weights[rule], evidence, suggestionKey: rule,
    });
  }
  const scope: Scope = {kind: "profile", id: profile.id, name: profile.login};
  for (const [rule, value] of [["bio", Boolean(profile.bio?.trim())], ["website", httpUrl(profile.website)]] as const) {
    add(rule, "profile", scope, value, [{
      sourceUrl: `https://github.com/${profile.login}`, field: rule, checkedAt: input.checkedAt,
      detailKey: `${rule}.${value ? "pass" : "fail"}`,
    }]);
  }
  const profileState = readmeState(input.profileReadme);
  const profileReadmeValue = profileState === "unknown" ? null :
    input.profileReadme.status === "found" && Boolean(input.profileReadme.text.trim());
  add("profileReadme", "profile", scope, profileReadmeValue, [{
    ...fileEvidence(input.profileReadme, `${profile.login}/${profile.login}`, input.checkedAt),
    detailKey: profileReadmeValue === null ? "profileReadme.unknown" : profileReadmeValue ? "profileReadme.pass"
      : profileState === "missing" ? "readme.missing" : "readme.empty",
  }]);

  for (const {repo, readme} of [...input.repos].sort((a, b) => a.repo.id - b.repo.id)) {
    const scope: Scope = {kind: "repo", id: repo.id, name: `${profile.login}/${repo.name}`};
    const metadata = (field: string, value: boolean): Evidence => ({
      sourceUrl: `https://github.com/${scope.name}`, field, repo: {id: repo.id, fullName: scope.name},
      checkedAt: input.checkedAt, detailKey: `${field}.${value ? "pass" : "fail"}`,
    });
    const description = Boolean(repo.description?.trim());
    const topics = repo.topics.some(topic => Boolean(topic.trim()));
    add("description", "projects", scope, description, [metadata("description", description)]);
    add("topics", "projects", scope, topics, [metadata("topics", topics)]);
    const state = readmeState(readme);
    const signals: MarkdownSignals | null = state === "found" && readme.status === "found" ? inspectMarkdown(readme.text) : null;
    const readmeValue = (rule: keyof MarkdownSignals): boolean | null => state === "unknown" ? null : signals?.[rule].pass === true;
    const evidence = (rule: keyof MarkdownSignals): Evidence => ({
      ...fileEvidence(readme, scope.name, input.checkedAt, repo.id),
      detailKey: state === "missing" ? "readme.missing" : state === "found" && !signals?.readme.pass ? "readme.empty"
        : `${rule}.${state === "unknown" ? "unknown" : signals?.[rule].pass ? "pass" : "fail"}`,
      line: signals?.[rule].line, excerpt: signals?.[rule].excerpt,
    });
    const homepage = httpUrl(repo.homepage);
    add("demo", "projects", scope, homepage ? true : readmeValue("demo"), [metadata("homepage", homepage), evidence("demo")]);
    add("image", "projects", scope, readmeValue("image"), [evidence("image")]);
    for (const rule of ["readme", "purpose", "install", "usage", "technology", "features"] as const) {
      add(rule, "readme", scope, readmeValue(rule), [evidence(rule)]);
    }
  }
  const categories: Category[] = (["profile", "projects", "readme"] as const).map(id => {
    const selected = checks.filter(check => check.category === id);
    const max = id === "profile" ? 20 : id === "projects" ? 30 : 50;
    let sum = 0;
    for (const check of selected) {
      if (check.earned === null) return {id, status: "incomplete", rawScore: null, score: null, max};
      sum += check.earned;
    }
    const rawScore = sum / (id === "profile" ? 1 : input.repos.length);
    return {id, status: "complete", rawScore, score: round(rawScore), max};
  });
  let score: number | null = 0;
  for (const category of categories) {
    if (category.score === null) { score = null; break; }
    score += category.score;
  }
  if (score !== null) score = round(score);
  return {
    rulesVersion: RULES_VERSION, status: score === null ? "incomplete" : "complete", score, checks, categories,
    profileType: score === null ? null : profileType(checks, score),
    recommendations: recommendations(checks, categories, input.repos.length),
  };
}
