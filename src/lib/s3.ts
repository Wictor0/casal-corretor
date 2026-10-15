import 'server-only';
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

let _c: S3Client | null = null;
export const bucket = () => process.env.S3_BUCKET!;
export function s3() {
  if (!_c) {
    _c = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION || 'auto',
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
    });
  }
  return _c;
}
export async function enviar(key: string, body: Buffer, contentType: string) {
  await s3().send(new PutObjectCommand({ Bucket: bucket(), Key: key, Body: body, ContentType: contentType, CacheControl: 'public, max-age=31536000, immutable' }));
}
export async function baixar(key: string) {
  return s3().send(new GetObjectCommand({ Bucket: bucket(), Key: key }));
}
export async function apagar(key: string) {
  try { await s3().send(new DeleteObjectCommand({ Bucket: bucket(), Key: key })); } catch { /* ignora */ }
}
export const midiaUrl = (key?: string | null) => (key ? `/midia/${key}` : '');
