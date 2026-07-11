import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authenticator } from "otplib";
import { prisma } from "@/lib/prisma";
import { createRefreshToken, hashToken, signAccessToken } from "@/lib/tokens";
import { requireAuth } from "@/middleware/auth";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  totpCode: z.string().optional(),
});

const REFRESH_COOKIE = "refreshToken";
const isProd = process.env.NODE_ENV === "production";

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Ungueltige Eingabe" });
  }
  const { email, password, totpCode } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return res.status(401).json({ error: "E-Mail oder Passwort falsch" });
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ error: "E-Mail oder Passwort falsch" });
  }

  if (user.twoFactorEnabled) {
    if (!totpCode) {
      return res.status(200).json({ requiresTwoFactor: true });
    }
    const isValidTotp = authenticator.check(totpCode, user.twoFactorSecret ?? "");
    if (!isValidTotp) {
      return res.status(401).json({ error: "2FA-Code ungueltig" });
    }
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const { token: refreshToken, hash, expiresAt } = createRefreshToken();

  await prisma.refreshToken.create({
    data: { userId: user.id, tokenHash: hash, expiresAt },
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    expires: expiresAt,
    path: "/api/auth",
  });

  res.json({
    accessToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

authRouter.post("/refresh", async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) {
    return res.status(401).json({ error: "Kein Refresh Token" });
  }

  const hash = hashToken(token);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hash } });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    return res.status(401).json({ error: "Refresh Token ungueltig" });
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || !user.isActive) {
    return res.status(401).json({ error: "Nutzer nicht gefunden" });
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  res.json({ accessToken });
});

authRouter.post("/logout", async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    const hash = hashToken(token);
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.json({ success: true });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: "Nutzer nicht gefunden" });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

authRouter.post("/2fa/setup", requireAuth, async (req, res) => {
  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { id: req.user!.id }, data: { twoFactorSecret: secret } });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  const otpauth = authenticator.keyuri(user.email, "Gewerbeverein Lensahn", secret);
  res.json({ otpauth });
});

authRouter.post("/2fa/verify", requireAuth, async (req, res) => {
  const { code } = req.body as { code?: string };
  const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
  if (!code || !authenticator.check(code, user.twoFactorSecret ?? "")) {
    return res.status(400).json({ error: "Code ungueltig" });
  }
  await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
  res.json({ success: true });
});
