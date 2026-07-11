import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/middleware/auth";

export const publicFormsRouter = Router();

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(1),
});

publicFormsRouter.post("/contact", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const submission = await prisma.contactSubmission.create({ data: parsed.data });
  res.status(201).json({ success: true, id: submission.id });
});

const newsletterSchema = z.object({ email: z.string().email() });

publicFormsRouter.post("/newsletter/subscribe", async (req, res) => {
  const parsed = newsletterSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const confirmToken = crypto.randomUUID();
  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email, confirmToken },
  });

  // TODO: send double opt-in confirmation email via nodemailer
  res.status(201).json({ success: true, id: subscriber.id });
});

publicFormsRouter.get("/newsletter/confirm/:token", async (req, res) => {
  const subscriber = await prisma.newsletterSubscriber.findFirst({
    where: { confirmToken: req.params.token },
  });
  if (!subscriber) return res.status(404).json({ error: "Token ungueltig" });
  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { confirmed: true, confirmToken: null },
  });
  res.json({ success: true });
});

const applicationSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  category: z.enum(["HANDWERK", "DIENSTLEISTUNG", "GASTRONOMIE", "HANDEL", "INDUSTRIE", "FREIE_BERUFE"]),
  message: z.string().optional(),
  sepaMandateRef: z.string().optional(),
  signatureData: z.string().optional(),
});

publicFormsRouter.post("/membership-applications", async (req, res) => {
  const parsed = applicationSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const application = await prisma.membershipApplication.create({ data: parsed.data });
  // TODO: send automatic confirmation email via nodemailer
  res.status(201).json({ success: true, id: application.id });
});

publicFormsRouter.get(
  "/membership-applications",
  requireAuth,
  requireRole("ADMIN", "VORSTAND"),
  async (_req, res) => {
    const applications = await prisma.membershipApplication.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(applications);
  },
);

publicFormsRouter.put(
  "/membership-applications/:id/status",
  requireAuth,
  requireRole("ADMIN", "VORSTAND"),
  async (req, res) => {
    const { status } = req.body as { status?: string };
    if (!status || !["SUBMITTED", "IN_REVIEW", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Ungueltiger Status" });
    }
    const application = await prisma.membershipApplication.update({
      where: { id: req.params.id },
      data: { status: status as never },
    });
    res.json(application);
  },
);
