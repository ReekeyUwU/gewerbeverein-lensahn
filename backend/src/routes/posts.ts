import { Router } from "express";
import { z } from "zod";
import sanitizeHtml from "sanitize-html";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middleware/auth";

function sanitizePostContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["h1", "h2", "img"]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
      a: ["href", "name", "target", "rel"],
    },
  });
}

export const postsRouter = Router();

postsRouter.get("/", async (req, res) => {
  const { category, page = "1", pageSize = "10" } = req.query as Record<string, string>;
  const take = Math.min(Number(pageSize) || 10, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = {
    status: "PUBLISHED" as const,
    ...(category ? { category } : {}),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({ where, orderBy: { publishedAt: "desc" }, take, skip }),
    prisma.post.count({ where }),
  ]);

  res.json({ posts, total, page: Number(page), pageSize: take });
});

postsRouter.get("/:slug", async (req, res) => {
  const post = await prisma.post.findUnique({ where: { slug: req.params.slug } });
  if (!post || post.status !== "PUBLISHED") {
    return res.status(404).json({ error: "Beitrag nicht gefunden" });
  }
  res.json(post);
});

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishedAt: z.coerce.date().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

postsRouter.post("/", requireAuth, requireRole("ADMIN", "REDAKTEUR"), async (req, res) => {
  const parsed = postSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const post = await prisma.post.create({
    data: { ...parsed.data, content: sanitizePostContent(parsed.data.content) },
  });
  res.status(201).json(post);
});

postsRouter.put("/:id", requireAuth, requireRole("ADMIN", "REDAKTEUR"), async (req, res) => {
  const parsed = postSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const post = await prisma.post.update({
    where: { id: req.params.id },
    data: {
      ...parsed.data,
      ...(parsed.data.content ? { content: sanitizePostContent(parsed.data.content) } : {}),
    },
  });
  res.json(post);
});

postsRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  await prisma.post.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
