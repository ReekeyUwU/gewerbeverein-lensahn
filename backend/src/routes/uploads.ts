import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "@/middleware/auth";
import { uploadFile, uploadOptimizedImage } from "@/lib/storage";

export const uploadsRouter = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

uploadsRouter.post(
  "/image",
  requireAuth,
  requireRole("ADMIN", "REDAKTEUR"),
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Keine Datei uebermittelt" });
    const url = await uploadOptimizedImage(req.file.buffer, req.file.originalname);
    res.status(201).json({ url });
  },
);

uploadsRouter.post(
  "/file",
  requireAuth,
  requireRole("ADMIN", "REDAKTEUR"),
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Keine Datei uebermittelt" });
    const url = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.status(201).json({ url });
  },
);
