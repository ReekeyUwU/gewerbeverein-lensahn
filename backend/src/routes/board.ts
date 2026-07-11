import { Router } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middleware/auth";

export const boardRouter = Router();

boardRouter.get("/", async (_req, res) => {
  const members = await prisma.boardMember.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(members);
});

const boardSchema = z.object({
  name: z.string().min(1),
  position: z.string().min(1),
  portraitUrl: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

boardRouter.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = boardSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const member = await prisma.boardMember.create({ data: parsed.data });
  res.status(201).json(member);
});

boardRouter.put("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const parsed = boardSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const member = await prisma.boardMember.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(member);
});

boardRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  await prisma.boardMember.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
