import {vi} from "vitest";

export const profile = {
  id: 7, login: "mona", name: "Mona", bio: null, website: null,
  avatarUrl: "https://avatars.githubusercontent.com/u/7",
};

export function repository(id = 10, changes: Record<string, unknown> = {}) {
  return {
    id, name: `project-${id}`, owner: {id: 7, login: "mona", type: "User"},
    private: false, archived: false, fork: false, description: "Example", homepage: null,
    language: "TypeScript", topics: ["web"], default_branch: "main", updated_at: "2026-10-28T00:00:00Z",
    ...changes,
  };
}

export function readme(text = "# Example") {
  return {type: "file", encoding: "base64", size: Buffer.byteLength(text),
    content: Buffer.from(text).toString("base64"), path: "README.md", sha: "a".repeat(40)};
}

export function json(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {status, headers});
}

export function respond(...responses: Response[]) {
  const fetch = vi.mocked(globalThis.fetch);
  for (const response of responses) fetch.mockResolvedValueOnce(response);
  return fetch;
}
