import type {Nodes, RootContent} from "mdast";
import remarkParse from "remark-parse";
import {unified} from "unified";

export const headingAliases = {
  purpose: [
    "purpose", "about", "about the project", "overview", "amaç", "projenin amacı", "proje amacı", "proje özeti",
    "project purpose", "project summary", "project overview", "bu proje neden var", "ne problemi çözüyor",
    "why this project", "what problem does it solve", "hakkında", "proje hakkında", "genel bakış",
  ],
  install: [
    "installation", "install", "setup", "getting started", "kurulum", "başlangıç",
    "backend kurulumu", "frontend kurulumu", "backend installation", "frontend installation", "backend setup", "frontend setup",
  ],
  usage: [
    "usage", "how to use", "run", "running", "development", "kullanım", "çalıştırma", "geliştirme",
    "uygulamayı çalıştır", "uygulamayı çalıştırma", "run the app", "running the app", "run the application", "running the application",
  ],
  technology: ["technologies", "tech stack", "technology stack", "built with", "teknolojiler", "kullanılan teknolojiler", "teknoloji yığını"],
  features: ["features", "key features", "özellikler", "temel özellikler"],
  demo: ["demo", "live demo", "preview", "canlı demo", "canlı önizleme", "önizleme"],
} as const;

type SectionRule = Exclude<keyof typeof headingAliases, "demo">;
export type Signal = {pass: boolean; line?: number; excerpt?: string};
export type MarkdownSignals = Record<SectionRule | "demo" | "image" | "readme", Signal>;
const parser = unified().use(remarkParse).freeze();

function normalize(text: string): string {
  return text.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i")
    .toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function httpUrl(value: string | null): boolean {
  if (!value || /[\s\u0000-\u001f\u007f]/u.test(value)) return false;
  if (!/^https?:\/\//i.test(value)) return false;
  const url = URL.parse(value);
  return url !== null && ["http:", "https:"].includes(url.protocol) &&
    Boolean(url.hostname) && !url.username && !url.password;
}

function imageUrl(value: string): boolean {
  if (httpUrl(value)) return true;
  return Boolean(value.trim()) && !/^[\s#\\]|^\/\/|[\u0000-\u0020\u007f]|^[^/]*:/u.test(value);
}

function text(node: Nodes): string {
  if (node.type === "text" || node.type === "inlineCode") return node.value;
  if ("children" in node) return node.children.map(text).join(" ");
  return "";
}

function walk(node: Nodes, visit: (node: Nodes) => void) {
  visit(node);
  if ("children" in node) node.children.forEach(child => walk(child, visit));
}

function explanatory(node: Nodes): boolean {
  return node.type === "paragraph" && !node.children.some(child => child.type === "html") &&
    (text(node).match(/[\p{L}\p{N}]+/gu)?.length ?? 0) >= 3;
}

function command(node: Nodes): boolean {
  if (node.type === "code") {
    const value = node.value.trim();
    const bareHeading = Object.values(headingAliases).some(aliases => aliases.some(alias => normalize(alias) === normalize(value)));
    return Boolean(value) && !bareHeading && (/\s|[./=;(){}]/.test(value) || value === "make");
  }
  return node.type === "inlineCode" && /^(?:\$\s*)?(?:(?:npm|npx|pnpm|yarn|bun|git|pip|python|python3|docker|cargo|go|node|deno|dotnet)\s+\S|make(?:\s|$)|\.\/\S)/.test(node.value.trim());
}

function signal(node?: Nodes): Signal {
  return node ? {pass: true, line: node.position?.start.line, excerpt: (text(node) || (node.type === "code" ? node.value : "")).trim().slice(0, 160)} : {pass: false};
}

export function inspectMarkdown(markdown: string): MarkdownSignals {
  const root = parser.parse(markdown);
  const definitions = new Map<string, string>();
  walk(root, node => {
    if (node.type === "definition") definitions.set(node.identifier.toUpperCase(), node.url);
  });
  const result: MarkdownSignals = {
    readme: {pass: Boolean(markdown.trim())}, purpose: {pass: false}, install: {pass: false},
    usage: {pass: false}, technology: {pass: false}, features: {pass: false},
    demo: {pass: false}, image: {pass: false},
  };
  const sections: {rule: keyof typeof headingAliases; nodes: RootContent[]; depth: number}[] = [];
  const active: typeof sections = [];
  const demoNodes = new Set<RootContent>();
  for (const node of root.children) {
    if (node.type === "heading") {
      while (active.length && active[active.length - 1].depth >= node.depth) active.pop();
      const title = normalize(text(node).replace(/^[^\p{L}\p{N}]+/u, "")
        .replace(/^(?:\d{1,2}(?:\.\d{1,2})*[.)]\s+|\d{1,2}(?:\.\d{1,2})+\s+)/, ""));
      for (const rule of Object.keys(headingAliases) as (keyof typeof headingAliases)[]) {
        if (!headingAliases[rule].some(alias => normalize(alias) === title)) continue;
        const section = {rule, nodes: [], depth: node.depth};
        sections.push(section);
        active.push(section);
      }
    } else {
      for (const section of active) {
        section.nodes.push(node);
        if (section.rule === "demo") demoNodes.add(node);
      }
    }
  }
  for (const section of sections) {
    if (section.rule === "demo") continue;
    let match: Nodes | undefined;
    for (const node of section.nodes) {
      walk(node, child => {
        if (match) return;
        const paragraph = explanatory(child);
        const list = child.type === "list" && child.children.some(item => Boolean(text(item).trim()));
        if ((section.rule === "purpose" && paragraph) ||
          (section.rule === "install" && command(child)) ||
          (section.rule === "usage" && (paragraph || command(child))) ||
          (["technology", "features"].includes(section.rule) && (paragraph || list))) match = child;
      });
    }
    if (match && !result[section.rule].pass) result[section.rule] = signal(match);
  }
  root.children.forEach(node => {
    const demoSection = demoNodes.has(node);
    walk(node, child => {
      if (child.type === "image" || child.type === "imageReference") {
        const url = child.type === "image" ? child.url : definitions.get(child.identifier.toUpperCase());
        if (url && imageUrl(url) && !result.image.pass) result.image = signal(child);
      }
      if (child.type === "link" || child.type === "linkReference") {
        const url = child.type === "link" ? child.url : definitions.get(child.identifier.toUpperCase());
        const label = normalize(text(child));
        const marked = headingAliases.demo.some(alias => (` ${label} `).includes(` ${normalize(alias)} `));
        if (url && httpUrl(url) && (marked || demoSection) && !result.demo.pass) result.demo = signal(child);
      }
    });
  });
  return result;
}
