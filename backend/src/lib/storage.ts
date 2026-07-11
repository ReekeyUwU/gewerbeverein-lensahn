import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const STORAGE_DRIVER = process.env.STORAGE_DRIVER ?? "local";

const LOCAL_UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
const LOCAL_PUBLIC_URL = process.env.UPLOAD_PUBLIC_URL ?? "/uploads";

async function saveLocal(buffer: Buffer, subdir: string, filename: string): Promise<string> {
  const dir = path.join(LOCAL_UPLOAD_DIR, subdir);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  return `${LOCAL_PUBLIC_URL}/${subdir}/${filename}`;
}

async function saveS3(buffer: Buffer, key: string, contentType: string): Promise<string> {
  // Dynamically imported so the S3 SDK is only required when actually configured for S3 storage.
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
    region: process.env.S3_REGION ?? "us-east-1",
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
      secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
    },
  });
  const bucket = process.env.S3_BUCKET ?? "gewerbeverein-lensahn";
  const publicBaseUrl = process.env.S3_PUBLIC_URL ?? "http://localhost:9000/gewerbeverein-lensahn";

  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: buffer, ContentType: contentType }));
  return `${publicBaseUrl}/${key}`;
}

export async function uploadOptimizedImage(buffer: Buffer, _originalName: string): Promise<string> {
  const optimized = await sharp(buffer)
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const filename = `${crypto.randomUUID()}.webp`;

  if (STORAGE_DRIVER === "s3") {
    return saveS3(optimized, `images/${filename}`, "image/webp");
  }
  return saveLocal(optimized, "images", filename);
}

export async function uploadFile(buffer: Buffer, originalName: string, contentType: string): Promise<string> {
  const ext = originalName.split(".").pop() ?? "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;

  if (STORAGE_DRIVER === "s3") {
    return saveS3(buffer, `files/${filename}`, contentType);
  }
  return saveLocal(buffer, "files", filename);
}
