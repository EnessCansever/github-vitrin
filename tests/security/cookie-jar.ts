const values = new Map<string, string>();
export const jar = {
  get: (name: string) => values.has(name) ? {value: values.get(name)!} : undefined,
  set: (name: string, value: string) => values.set(name, value),
  clear: () => values.clear(),
};
