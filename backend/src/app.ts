import express from "express";
import type { NextFunction, Request, Response } from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { rateLimit } from "express-rate-limit";
import "express-async-errors";

import { authRouter } from "@/routes/auth";
import { membersRouter } from "@/routes/members";
import { eventsRouter } from "@/routes/events";
import { postsRouter } from "@/routes/posts";
import { galleryRouter } from "@/routes/gallery";
import { sponsorsRouter } from "@/routes/sponsors";
import { downloadsRouter } from "@/routes/downloads";
import { boardRouter } from "@/routes/board";
import { publicFormsRouter } from "@/routes/public-forms";
import { uploadsRouter } from "@/routes/uploads";
import { usersRouter } from "@/routes/users";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "5mb" }));
  app.use(cookieParser());

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
  app.use("/api/auth/login", authLimiter);

  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

  app.use(
    "/uploads",
    (req, res, next) => {
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads")),
  );

  app.use("/api/auth", authRouter);
  app.use("/api/members", membersRouter);
  app.use("/api/events", eventsRouter);
  app.use("/api/posts", postsRouter);
  app.use("/api/gallery", galleryRouter);
  app.use("/api/sponsors", sponsorsRouter);
  app.use("/api/downloads", downloadsRouter);
  app.use("/api/board", boardRouter);
  app.use("/api/forms", publicFormsRouter);
  app.use("/api/uploads", uploadsRouter);
  app.use("/api/users", usersRouter);

  app.use((_req, res) => res.status(404).json({ error: "Nicht gefunden" }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(400).json({ error: "Ungueltige Anfrage" });
  });

  return app;
}
