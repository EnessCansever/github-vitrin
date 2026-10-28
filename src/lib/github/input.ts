import {z} from "zod";

export const loginSchema = z.string().min(1).max(39)
  .regex(/^[a-z\d]+(?:-[a-z\d]+)*$/i);

export const profileInput = z.string().trim().max(256).transform((value, ctx) => {
  const match = /^(?:https:\/\/)?github\.com\/([^/?#]+)\/?$/i.exec(value);
  const result = loginSchema.safeParse(match ? match[1] : value);
  if (!result.success) {
    ctx.addIssue({code: "custom", message: "Enter a GitHub username or https://github.com/username."});
    return z.NEVER;
  }
  return result.data.toLowerCase();
});

export function normalizeProfile(input: unknown): string {
  return profileInput.parse(input);
}
