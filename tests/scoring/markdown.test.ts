import {describe, expect, it} from "vitest";
import {httpUrl, inspectMarkdown} from "../../src/features/analysis/scoring/markdown";
import {english, turkish} from "./fixtures";

describe("Markdown evidence", () => {
  it("recognizes equivalent TR/EN sections without locale-dependent calculation", () => {
    for (const content of [english, turkish, turkish.replace("Kurulum", "KURULUM").replace("Kullanım", "KULLANIM")]) {
      expect(Object.values(inspectMarkdown(content)).every(signal => signal.pass)).toBe(true);
    }
  });
  it("requires content beyond an empty heading or a single keyword", () => {
    const result = inspectMarkdown("## About\nProject\n## Installation\nInstallation\n## Usage\nUsage\n## Technologies\nReact\n## Features\nFeatures");
    expect([result.purpose.pass, result.install.pass, result.usage.pass, result.technology.pass, result.features.pass]).toEqual([false, false, false, false, false]);
  });
  it("includes nested content but stops at the next same or higher heading", () => {
    expect(inspectMarkdown("## Installation\n### Linux\n```sh\nnpm install\n```\n## Features\n- Notes").install.pass).toBe(true);
    expect(inspectMarkdown("## Installation\n## Features\n```sh\nnpm install\n```").install.pass).toBe(false);
    expect(inspectMarkdown("### Installation\n# Other\n```sh\nnpm install\n```").install.pass).toBe(false);
  });
  it("does not turn code headings into sections or borrow a command from elsewhere", () => {
    const result = inspectMarkdown("```md\n## Installation\nnpm install\n```\n## Usage\nUse this application locally.");
    expect(result.install.pass).toBe(false);
    expect(result.usage.pass).toBe(true);
    expect(inspectMarkdown("## Kurulum\n```\nKurulum\n```").install.pass).toBe(false);
  });
  it("supports setext headings and inline commands in their own section", () => {
    expect(inspectMarkdown("Installation\n------------\n`npm install`\n\nUsage\n-----\n`npm start`").install.pass).toBe(true);
    expect(inspectMarkdown("## About\n```sh\nnpm start\n```").purpose.pass).toBe(false);
  });
  it("resolves reference links and images including collapsed references", () => {
    const result = inspectMarkdown("[Live demo][app]\n![Screenshot][]\n\n[app]: https://example.org\n[Screenshot]: images/app.png");
    expect(result.demo.pass).toBe(true);
    expect(result.image.pass).toBe(true);
    expect(result.demo.line).toBe(1);
    expect(result.image.line).toBe(2);
  });
  it("does not treat unrelated links, prose mentioning demo, or unreferenced definitions as demos", () => {
    for (const content of ["[Documentation](https://example.org)", "Demo is planned. [Source](https://example.org)", "[demo]: https://example.org"]) {
      expect(inspectMarkdown(content).demo.pass).toBe(false);
    }
  });
  it.each(["javascript:alert%281%29", "data:text/html,test", "ftp://example.org", "//example.org", "https://user:password@example.org"])("rejects unsafe demo/image URL %s", url => {
    const result = inspectMarkdown(`[Demo](${url})\n![Screenshot](${url})`);
    expect(result.demo.pass).toBe(false);
    expect(result.image.pass).toBe(false);
  });
  it("ignores raw HTML and script, preserving only Markdown evidence", () => {
    const result = inspectMarkdown('<script>\n## Installation\nnpm install\n</script>\n\n<a href="https://example.org">Demo</a>\n<img src="preview.png">\n\n## About\n<script>alert(1)</script>');
    expect(result.demo.pass).toBe(false);
    expect(result.image.pass).toBe(false);
    expect(result.install.pass).toBe(false);
    expect(result.purpose.pass).toBe(false);
  });
  it.each(["https://example.org", "http://localhost:3000"])("accepts a syntactically valid HTTP URL without fetching %s", value => {
    expect(httpUrl(value)).toBe(true);
  });
  it.each([null, "", "example.org", "https:\\example.org", " https://example.org", "https://x\n.example.org", "javascript:alert(1)"])("rejects an invalid website value %s", value => {
    expect(httpUrl(value)).toBe(false);
  });
});

describe("general headings and numbered sections", () => {
  it.each(["Proje Özeti", "Proje Amacı", "Project summary", "Project purpose", "Project overview"])("recognizes the general purpose heading %s with explanatory content", heading => {
    expect(inspectMarkdown(`## ${heading}\nThis application organizes team notes.`).purpose.pass).toBe(true);
    expect(inspectMarkdown(`## ${heading}\nNotes`).purpose.pass).toBe(false);
  });
  it.each(["Bu proje neden var?", "Ne problemi çözüyor?", "Why this project?", "What problem does it solve?"])("supports the bounded general question heading %s", heading => {
    expect(inspectMarkdown(`## ${heading}\nThis application organizes team notes.`).purpose.pass).toBe(true);
  });
  it.each(["Lantern Neden Var?", "Why does Lantern exist?", "Neden log tutuyoruz?", "Project summary changelog"])("does not infer project purpose from an arbitrary heading %s", heading => {
    expect(inspectMarkdown(`## ${heading}\nThis application organizes team notes.`).purpose.pass).toBe(false);
  });
  it.each(["1. Kurulum", "2) Installation", "2.1 Setup", "2.1. Installation", "⚙️ 3. Backend Kurulumu", "4) Frontend setup"])("recognizes a numbered installation heading %s", heading => {
    expect(inspectMarkdown(`## ${heading}\n\`\`\`sh\nnpm install\n\`\`\``).install.pass).toBe(true);
  });
  it.each(["4) Uygulamayı çalıştır", "2.1 Run the app", "3. Running the application", "🎯 1. Kullanım"])("recognizes a numbered usage heading %s", heading => {
    expect(inspectMarkdown(`### ${heading}\n\`npm run dev\``).usage.pass).toBe(true);
  });
  it("keeps numbered sibling boundaries and does not borrow unrelated code or prose", () => {
    const result = inspectMarkdown("## 1. Proje Amacı\nNotes\n## 2. Kurulum\nRequirements\n## 3. Kullanım\nUsage\n## 4. Other\nThis application organizes team notes.\n```sh\nnpm install\n```");
    expect(result.purpose.pass).toBe(false);
    expect(result.install.pass).toBe(false);
    expect(result.usage.pass).toBe(false);
  });
  it("checks backend installation in its own section without extending the previous section", () => {
    const markdown = "## Kurulum\n- Node.js\n## 2. Backend Kurulumu\n```sh\nnpm install\n```\n## 3. Notes\nOther notes here.";
    expect(inspectMarkdown(markdown).install).toMatchObject({pass: true, line: 4});
    expect(inspectMarkdown(markdown.replace("2. Backend Kurulumu", "2. Notes")).install.pass).toBe(false);
  });
  it("does not turn an installation command into a usage check", () => {
    const result = inspectMarkdown("## 1. Kurulum\n```sh\nnpm install\nnpm run dev\n```");
    expect(result.install.pass).toBe(true);
    expect(result.usage.pass).toBe(false);
  });
  it.each(["2026 Overview", "100. Kurulum", "1.Kurulum", "Version 2 installation"])("does not remove arbitrary numbers or infer fuzzy matches in %s", heading => {
    const result = inspectMarkdown(`## ${heading}\nThis application organizes team notes.\n\`npm install\``);
    expect(result.purpose.pass).toBe(false);
    expect(result.install.pass).toBe(false);
  });
});
