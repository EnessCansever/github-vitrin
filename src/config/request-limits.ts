import "server-only";

export const requestLimits = {
  search: {limit: 20, windowMs: 600_000},
  analysis: {limit: 10, windowMs: 600_000},
  report: {limit: 60, windowMs: 60_000},
  card: {limit: 10, windowMs: 600_000},
} as const;

export const analysisRefresh = {limit: 1, windowMs: 60_000} as const;
export const analysisLeaseMs = 45_000;
