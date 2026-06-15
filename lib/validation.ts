import { z } from "zod";

export const postStatuses = ["DRAFT", "PUBLISHED", "SCHEDULED"] as const;
export const visibilityOptions = ["PUBLIC", "PRIVATE"] as const;

export type PostStatus = (typeof postStatuses)[number];
export type Visibility = (typeof visibilityOptions)[number];

export const postInputSchema = z.object({
  title: z.string().trim().min(1, "제목을 입력하세요."),
  subtitle: z.string().trim().optional().nullable(),
  slug: z.string().trim().optional().nullable(),
  contentJson: z.unknown(),
  contentHtml: z.string(),
  excerpt: z.string().trim().optional().nullable(),
  coverImageUrl: z.string().trim().optional().nullable(),
  status: z.enum(postStatuses),
  visibility: z.enum(visibilityOptions),
  categoryName: z.string().trim().optional().nullable(),
  tagNames: z.array(z.string().trim()).default([]),
  seoTitle: z.string().trim().optional().nullable(),
  seoDescription: z.string().trim().optional().nullable(),
  scheduledAt: z.string().trim().optional().nullable()
});
