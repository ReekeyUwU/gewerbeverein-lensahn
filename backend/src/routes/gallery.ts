import { Router } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middleware/auth";

export const galleryRouter = Router();

galleryRouter.get("/", async (_req, res) => {
  const albums = await prisma.galleryAlbum.findMany({
    include: { images: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(albums);
});

galleryRouter.get("/:slug", async (req, res) => {
  const album = await prisma.galleryAlbum.findUnique({
    where: { slug: req.params.slug },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  if (!album) return res.status(404).json({ error: "Album nicht gefunden" });
  res.json(album);
});

const albumSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  eventId: z.string().optional(),
  coverUrl: z.string().optional(),
});

galleryRouter.post("/", requireAuth, requireRole("ADMIN", "REDAKTEUR"), async (req, res) => {
  const parsed = albumSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const album = await prisma.galleryAlbum.create({ data: parsed.data });
  res.status(201).json(album);
});

const imageSchema = z.object({
  url: z.string().min(1),
  type: z.enum(["image", "video"]).default("image"),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().int().optional(),
});

galleryRouter.post("/:albumId/images", requireAuth, requireRole("ADMIN", "REDAKTEUR"), async (req, res) => {
  const parsed = imageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const image = await prisma.galleryImage.create({
    data: { ...parsed.data, albumId: req.params.albumId },
  });
  res.status(201).json(image);
});

galleryRouter.delete("/images/:imageId", requireAuth, requireRole("ADMIN", "REDAKTEUR"), async (req, res) => {
  await prisma.galleryImage.delete({ where: { id: req.params.imageId } });
  res.status(204).send();
});
