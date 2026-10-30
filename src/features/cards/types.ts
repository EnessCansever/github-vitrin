export const cardFormats = {
  story: {width: 1080, height: 1920},
  landscape: {width: 1200, height: 630},
} as const;

export type CardFormat = keyof typeof cardFormats;
export type CardContent = {
  brand: string;
  author: string;
  username: string;
  title: string[];
  score: string;
  scoreLabel: string;
  categories: {label: string; points: string}[];
  task: {target: string; text: string} | null;
  firstStep: string;
  noTask: string;
  date: string;
  scope: string;
  identity: string;
  signature: string;
  invitation: string;
};
export type CardResponse = {
  status: "success";
  png: string;
  format: CardFormat;
  locale: "tr" | "en";
  width: number;
  height: number;
} | {status: "error"; code: "invalid" | "missing" | "incomplete" | "unavailable" | "render"};
