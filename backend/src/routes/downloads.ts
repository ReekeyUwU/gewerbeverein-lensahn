import { Router } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middleware/auth";

export const downloadsRouter = Router();

downloadsRouter.get("/", async (_req, res) => {
  const downloads = await prisma.download.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(downloads);
});

const downloadSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  fileUrl: z.string().min(1),
  fileType: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

downloadsRouter.post("/", requireAuth, requireRole("ADMIN", "REDAKTEUR"), async (req, res) => {
  const parsed = downloadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const download = await prisma.download.create({ data: parsed.data });
  res.status(201).json(download);
});

downloadsRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  await prisma.download.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
