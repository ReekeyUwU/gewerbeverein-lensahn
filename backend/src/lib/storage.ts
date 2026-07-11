import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import sharp from "sharp";

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT ?? "http://localhost:9000",
  region: process.env.S3_REGION ?? "us-east-1",
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? "minioadmin",
    secretAccessKey: process.env.S3_SECRET_KEY ?? "minioadmin",
  },
});

const BUCKET = process.env.S3_BUCKET ?? "gewerbeverein-lensahn";
const PUBLIC_BASE_URL = process.env.S3_PUBLIC_URL ?? "http://localhost:9000/gewerbeverein-lensahn";

export async function uploadOptimizedImage(buffer: Buffer, originalName: string): Promise<string> {
  const key = `images/${crypto.randomUUID()}.webp`;
  const optimized = await sharp(buffer)
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: optimized,
      ContentType: "image/webp",
      Metadata: { originalName },
    }),
  );

  return `${PUBLIC_BASE_URL}/${key}`;
}

export async function uploadFile(buffer: Buffer, originalName: string, contentType: string): Promise<string> {
  const ext = originalName.split(".").pop() ?? "bin";
  const key = `files/${crypto.randomUUID()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: { originalName },
    }),
  );

  return `${PUBLIC_BASE_URL}/${key}`;
}
