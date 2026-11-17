import "server-only";

export function publicOrigin(): string {
  const value = process.env.SITE_URL?.trim() || (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "");
  try {
    const url = new URL(value);
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/" ||
      (url.protocol !== "https:" && !(process.env.NODE_ENV === "development" && url.protocol === "http:"))) throw new Error();
    return url.origin;
  } catch {
    throw new Error("site_url_configuration");
  }
}
