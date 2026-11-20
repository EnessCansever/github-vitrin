export const cardFormats = {
  story: {width: 1080, height: 1920},
  post: {width: 1080, height: 1350},
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
} | {status: "error"; code: "invalid" | "incompatible" | "missing" | "incomplete" | "unavailable" | "render" | "rateLimit" | "configuration"; retryAt?: string};

export type ProgressContent = {
  username: string;
  brand: string;
  title: string;
  delta: string;
  measurements: {label: string; date: string; score: string}[];
  categories: {label: string; delta: string}[];
  signals: string;
  scope: string;
  signature: string;
};
