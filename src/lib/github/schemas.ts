import {z} from "zod";
import {loginSchema} from "./input";

export const repoName = z.string().min(1).max(100).regex(/^[a-z\d_.-]+$/i)
  .refine(value => value !== "." && value !== "..");
const id = z.number().int().positive().safe();
const nullableText = z.string().nullable();
export const ownerSchema = z.object({id, login: loginSchema, type: z.enum(["User", "Organization"])});
export const repoSchema = z.object({
  id, name: repoName, owner: ownerSchema,
  private: z.boolean(), archived: z.boolean(), fork: z.boolean(),
  description: nullableText, homepage: nullableText, language: nullableText,
  topics: z.array(z.string()), default_branch: z.string().min(1), updated_at: z.iso.datetime(),
}).transform(repo => ({
  id: repo.id, name: repo.name, owner: repo.owner,
  isPrivate: repo.private, isArchived: repo.archived, isFork: repo.fork,
  description: repo.description, homepage: repo.homepage, language: repo.language,
  topics: repo.topics, defaultBranch: repo.default_branch, updatedAt: repo.updated_at,
}));
export type Repository = z.output<typeof repoSchema>;

export const profileSchema = z.object({
  databaseId: id, login: loginSchema, name: nullableText, bio: nullableText,
  websiteUrl: nullableText, avatarUrl: z.url(),
}).transform(profile => ({
  id: profile.databaseId, login: profile.login, name: profile.name,
  bio: profile.bio, website: profile.websiteUrl, avatarUrl: profile.avatarUrl,
}));
export type Profile = z.output<typeof profileSchema>;

export const pinnedSchema = z.object({nodes: z.array(z.object({
  databaseId: id, name: repoName, isPrivate: z.boolean(), isArchived: z.boolean(), isFork: z.boolean(),
  owner: z.object({login: loginSchema, __typename: z.enum(["User", "Organization"])}),
}))});

export const graphSchema = z.object({
  data: z.object({user: z.unknown()}).nullish(),
  errors: z.array(z.object({
    message: z.string().optional(),
    type: z.string().optional(), path: z.array(z.union([z.string(), z.number()])).optional(),
    extensions: z.object({code: z.string().optional()}).optional(),
  })).optional(),
});

export const readmeSchema = z.object({
  type: z.literal("file"), encoding: z.literal("base64"),
  size: z.number().int().nonnegative(), content: z.string(),
  path: z.string().min(1), sha: z.string().regex(/^[a-f\d]{40,64}$/i),
});

export const profileRepoSchema = z.object({
  databaseId: id, name: repoName, isPrivate: z.boolean(), isEmpty: z.boolean(),
  owner: z.object({login: loginSchema, __typename: z.literal("User")}),
  defaultBranchRef: z.object({name: z.string().min(1), target: z.object({
    oid: z.string().regex(/^[a-f\d]{40,64}$/i),
  })}).nullable(),
});
