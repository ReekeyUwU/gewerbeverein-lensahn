import { Router } from "express";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middleware/auth";

export const membersRouter = Router();

membersRouter.get("/", async (req, res) => {
  const { category, search, page = "1", pageSize = "12" } = req.query as Record<string, string>;
  const take = Math.min(Number(pageSize) || 12, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = {
    status: "ACTIVE" as const,
    ...(category ? { category: category as never } : {}),
    ...(search
      ? { companyName: { contains: search } }
      : {}),
  };

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      include: { images: true },
      orderBy: [{ isPremium: "desc" }, { companyName: "asc" }],
      take,
      skip,
    }),
    prisma.member.count({ where }),
  ]);

  res.json({ members, total, page: Number(page), pageSize: take });
});

membersRouter.get("/:slug", async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { slug: req.params.slug },
    include: { images: true },
  });
  if (!member || member.status !== "ACTIVE") {
    return res.status(404).json({ error: "Mitglied nicht gefunden" });
  }
  res.json(member);
});

const upsertSchema = z.object({
  companyName: z.string().min(1),
  slug: z.string().min(1),
  category: z.enum(["HANDWERK", "DIENSTLEISTUNG", "GASTRONOMIE", "HANDEL", "INDUSTRIE", "FREIE_BERUFE"]),
  description: z.string().optional(),
  logoUrl: z.string().optional(),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().optional(),
  isPremium: z.boolean().optional(),
});

membersRouter.post("/", requireAuth, requireRole("ADMIN", "REDAKTEUR"), async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const member = await prisma.member.create({ data: { ...parsed.data, status: "ACTIVE" } });
  res.status(201).json(member);
});

membersRouter.put("/:id", requireAuth, requireRole("ADMIN", "REDAKTEUR"), async (req, res) => {
  const parsed = upsertSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const member = await prisma.member.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(member);
});

membersRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  await prisma.member.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
