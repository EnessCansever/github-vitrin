export type RepoOption = {
  id: string;
  name: string;
  descriptionKey: string;
  language: string;
  pinned: boolean;
};

export const demoRepos: RepoOption[] = [
  { id: "sample-101", name: "paper-lantern", descriptionKey: "lantern", language: "TypeScript", pinned: true },
  { id: "sample-102", name: "quiet-orbit", descriptionKey: "orbit", language: "JavaScript", pinned: true },
  { id: "sample-103", name: "little-weather-window", descriptionKey: "weather", language: "TypeScript", pinned: false },
  { id: "sample-104", name: "small-steps-accessible-reading-journal", descriptionKey: "journal", language: "JavaScript", pinned: false },
];

export const initialRepoIds = ["sample-101", "sample-102"];
