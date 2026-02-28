import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT!,
  region: process.env.MINIO_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: process.env.MINIO_SECRET_KEY!,
  },
  // Required for MinIO path-style URLs (http://host:9000/bucket/key)
  forcePathStyle: true,
});

const DEFAULT_BUCKET = process.env.MINIO_BUCKET!;

export type UploadOptions = {
  bucket?: string;
  key: string;
  body: PutObjectCommandInput["Body"];
  contentType?: string;
  metadata?: Record<string, string>;
};

export async function uploadFile({
  bucket = DEFAULT_BUCKET,
  key,
  body,
  contentType,
  metadata,
}: UploadOptions): Promise<{ bucket: string; key: string; url: string }> {
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    })
  );

  return {
    bucket,
    key,
    url: `${process.env.MINIO_ENDPOINT}/${bucket}/${key}`,
  };
}

/** Returns a temporary pre-signed GET URL (default: 1 hour). */
export async function getPresignedUrl(
  key: string,
  bucket = DEFAULT_BUCKET,
  expiresInSeconds = 3600
): Promise<string> {
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn: expiresInSeconds }
  );
}

/** Returns a temporary pre-signed PUT URL for direct client uploads (default: 15 min). */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  bucket = DEFAULT_BUCKET,
  expiresInSeconds = 900
): Promise<string> {
  return getSignedUrl(
    client,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }),
    { expiresIn: expiresInSeconds }
  );
}

export async function deleteFile(
  key: string,
  bucket = DEFAULT_BUCKET
): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function fileExists(
  key: string,
  bucket = DEFAULT_BUCKET
): Promise<boolean> {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

export async function listFiles(
  prefix: string,
  bucket = DEFAULT_BUCKET
): Promise<Array<{ key: string; size: number; lastModified: Date }>> {
  const response = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix })
  );

  return (response.Contents ?? []).map((obj) => ({
    key: obj.Key!,
    size: obj.Size ?? 0,
    lastModified: obj.LastModified ?? new Date(),
  }));
}

/**
 * Builds a stable object key from parts.
 * buildKey("contacts", "abc123", "invoice.pdf") → "contacts/abc123/invoice.pdf"
 */
export function buildKey(...parts: string[]): string {
  return parts
    .map((p) => p.replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");
}
