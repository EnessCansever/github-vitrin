import type {Readme} from "../../src/lib/github/client";
import type {Profile, Repository} from "../../src/lib/github/schemas";
import type {AnalysisInput} from "../../src/features/analysis/scoring/types";

export const profile: Profile = {
  id: 1, login: "mira-sample", name: "Mira", bio: "Frontend developer",
  website: "https://example.org", avatarUrl: "https://example.org/avatar.png",
};
export function readme(text: string): Extract<Readme, {status: "found"}> {
  return {status: "found", text, path: "README.md", sha: "a".repeat(40), branch: "main"};
}
export function repo(id = 10): Repository {
  return {
    id, name: `project-${id}`, owner: {id: profile.id, login: profile.login, type: "User"},
    isPrivate: false, isArchived: false, isFork: false,
    description: "A project presentation", homepage: null, topics: ["frontend"],
    language: "TypeScript", defaultBranch: "main", updatedAt: "2026-10-28T00:00:00Z",
  };
}
export const english = `# Sample
## About
This application organizes reading notes.
## Installation
\`\`\`sh
npm install
\`\`\`
## Usage
Run the application locally.
## Technologies
- TypeScript
## Features
- Reading lists
## Demo
[Open application](https://example.org/demo)
![Project preview](./preview.png)
`;
export const turkish = `# Örnek
## Proje hakkında
Bu uygulama okuma notlarını düzenler.
## Kurulum
\`\`\`sh
npm install
\`\`\`
## Kullanım
Uygulamayı yerel ortamda çalıştır.
## Kullanılan teknolojiler
- TypeScript
## Özellikler
- Okuma listeleri
## Canlı demo
[Uygulamayı aç](https://example.org/demo)
![Proje görünümü](./preview.png)
`;
export function input(count = 1, markdown = english): AnalysisInput {
  return {
    rulesVersion: "1.0.0", profile: {...profile}, profileReadme: readme("Hello"),
    repos: Array.from({length: count}, (_, index) => ({repo: repo(10 + index), readme: readme(markdown)})),
    checkedAt: "2026-10-28T10:00:00Z",
  };
}
