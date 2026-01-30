import { createClient } from 'webdav';

const OWNCLOUD_URL = process.env.OWNCLOUD_URL?.replace(/\/+$/, '');
const OWNCLOUD_USERNAME = process.env.OWNCLOUD_USERNAME;
const OWNCLOUD_PASSWORD = process.env.OWNCLOUD_PASSWORD;
const OWNCLOUD_ROOT = process.env.OWNCLOUD_ROOT || '/tlacove_podklady';

if (!OWNCLOUD_URL || !OWNCLOUD_USERNAME || !OWNCLOUD_PASSWORD) {
  console.warn('ownCloud env vars missing: OWNCLOUD_URL/OWNCLOUD_USERNAME/OWNCLOUD_PASSWORD');
}

export const ownCloudClient = OWNCLOUD_URL
  ? createClient(OWNCLOUD_URL, {
      username: OWNCLOUD_USERNAME || '',
      password: OWNCLOUD_PASSWORD || ''
    })
  : null;

async function ensureDirectory(path: string) {
  if (!ownCloudClient) return;
  const normalized = path.replace(/\/+/g, '/');
  if (normalized === '' || normalized === '/') return;

  const parts = normalized.split('/').filter(Boolean);
  let current = '';
  for (const part of parts) {
    current = `${current}/${part}`;
    const exists = await ownCloudClient.exists(current);
    if (!exists) {
      await ownCloudClient.createDirectory(current);
    }
  }
}

export async function uploadToOwnCloud(
  fileName: string,
  buffer: Buffer,
  rootOverride?: string,
  subFolder?: string
) {
  if (!ownCloudClient) throw new Error('ownCloud client not configured');

  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const root = rootOverride || OWNCLOUD_ROOT;
  const baseFolder = root.replace(/\/+/g, '/');
  const folder = subFolder ? `${baseFolder}/${subFolder}`.replace(/\/+/g, '/') : baseFolder;
  const path = `${folder}/${sanitized}`.replace(/\/+/g, '/');

  await ensureDirectory(folder);

  await ownCloudClient.putFileContents(path, buffer, {
    overwrite: true
  });

  return {
    path,
    url: `${OWNCLOUD_URL}${path}`
  };
}
