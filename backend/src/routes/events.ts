import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middleware/auth";

export const eventsRouter = Router();

eventsRouter.get("/", async (req, res) => {
  const { upcoming } = req.query as Record<string, string>;
  const events = await prisma.event.findMany({
    where: upcoming ? { startAt: { gte: new Date() } } : undefined,
    orderBy: { startAt: "asc" },
    include: { _count: { select: { registrations: true } } },
  });
  res.json(events);
});

eventsRouter.get("/:slug", async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { slug: req.params.slug },
    include: { galleryAlbum: { include: { images: true } } },
  });
  if (!event) return res.status(404).json({ error: "Veranstaltung nicht gefunden" });
  res.json(event);
});

const eventSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional(),
  location: z.string().optional(),
  imageUrl: z.string().optional(),
  maxParticipants: z.coerce.number().int().optional(),
});

eventsRouter.post("/", requireAuth, requireRole("ADMIN", "REDAKTEUR", "VORSTAND"), async (req, res) => {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const event = await prisma.event.create({ data: parsed.data });
  res.status(201).json(event);
});

eventsRouter.put("/:id", requireAuth, requireRole("ADMIN", "REDAKTEUR", "VORSTAND"), async (req, res) => {
  const parsed = eventSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const event = await prisma.event.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(event);
});

eventsRouter.delete("/:id", requireAuth, requireRole("ADMIN"), async (req, res) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

const registrationSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  guests: z.coerce.number().int().min(0).default(0),
});

eventsRouter.post("/:id/register", async (req, res) => {
  const parsed = registrationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { registrations: true } } },
  });
  if (!event || !event.registrationOpen) {
    return res.status(404).json({ error: "Anmeldung nicht moeglich" });
  }

  const isFull = event.maxParticipants
    ? event._count.registrations + parsed.data.guests + 1 > event.maxParticipants
    : false;

  const registration = await prisma.eventRegistration.create({
    data: {
      eventId: event.id,
      name: parsed.data.name,
      email: parsed.data.email,
      guests: parsed.data.guests,
      waitlisted: isFull,
      qrCode: crypto.randomUUID(),
    },
  });

  res.status(201).json(registration);
});
