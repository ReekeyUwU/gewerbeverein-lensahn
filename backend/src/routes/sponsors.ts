import { Router } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middleware/auth";

export const sponsorsRouter = Router();

sponsorsRouter.get("/", async (_req, res) => {
  const sponsors = await prisma.sponsor.findMany({ orderBy: [{ tier: "asc" }, { sortOrder: "asc" }] });
  res.json(sponsors);
});

const sponsorSchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().min(1),
  websiteUrl: z.string().optional(),
  description: z.string().optional(),
  tier: z.string().optional(),
  contractStart: z.coerce.date().optional(),
  contractEnd: z.coerce.date().optional(),
});

sponsorsRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = sponsorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sponsor = await prisma.sponsor.create({ data: parsed.data });
  res.status(201).json(sponsor);
});

sponsorsRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = sponsorSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const sponsor = await prisma.sponsor.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(sponsor);
});

sponsorsRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  await prisma.sponsor.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
