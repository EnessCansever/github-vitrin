// Only the isolated E2E server imports this transport fixture.
const owner = {id: 901, login: "fixture-dev", type: "User"};
const repos = ["atlas", "beacon"].map((name, index) => ({
  id: 101 + index, name, owner, private: false, fork: false, archived: false, description: "Fixture project",
  homepage: null, topics: ["web"], language: "TypeScript", default_branch: "main", updated_at: "2026-01-01T00:00:00Z",
}));
let measurements = 0;
const localFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : input);
  if (url.hostname !== "api.github.com") {
    if (["127.0.0.1", "localhost"].includes(url.hostname) || url.protocol === "data:") return localFetch(input, init);
    throw Error("External fetch disabled in E2E");
  }
  if (url.pathname === "/graphql") {
    const body = init?.body ?? await input.text();
    const {query, variables} = JSON.parse(body);
    const user = variables.login !== owner.login ? null : query.includes("pinnedItems") ? {pinnedItems:{nodes:[]}}
      : query.includes("repository(") ? {databaseId:owner.id,login:owner.login,repository:null}
      : {databaseId:owner.id, login:owner.login, name:null, bio:"Projects", websiteUrl:null, avatarUrl:"https://example.org/avatar"};
    return Response.json({data:{user}});
  }
  if (url.pathname === "/users/fixture-dev/repos") return Response.json(repos);
  for (const repo of repos) {
    const path = "/repos/fixture-dev/" + repo.name;
    if (url.pathname === path) return Response.json(repo);
    if (url.pathname === path + "/readme") {
      const text = "# Atlas\n\nA small project for testing.\n" + (++measurements > 1 ? "\n## Install\n\n```sh\nnpm install\n```" : "");
      return Response.json({type:"file",encoding:"base64",content:Buffer.from(text).toString("base64"),
        size:Buffer.byteLength(text),path:"README.md",sha:(measurements===1?"a":"b").repeat(40)});
    }
  }
  throw Error("Unexpected E2E GitHub request");
};
