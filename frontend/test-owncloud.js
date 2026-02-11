const fs = require('fs');
const path = require('path');
const { createClient } = require('webdav');

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  content.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) return;
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  });
}

const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');
loadEnv(envPath);
loadEnv(envLocalPath);

async function testOwnCloud() {
  try {
    console.log('🔄 Testujem ownCloud upload...');
    console.log('OWNCLOUD_URL:', process.env.OWNCLOUD_URL);
    console.log('OWNCLOUD_USERNAME:', process.env.OWNCLOUD_USERNAME);
    console.log('OWNCLOUD_ROOT:', process.env.OWNCLOUD_ROOT);

    if (!process.env.OWNCLOUD_URL || !process.env.OWNCLOUD_USERNAME || !process.env.OWNCLOUD_PASSWORD) {
      throw new Error('Chýbajú OWNCLOUD env vars (URL/USERNAME/PASSWORD).');
    }

    const client = createClient(process.env.OWNCLOUD_URL.replace(/\/+$/, ''), {
      username: process.env.OWNCLOUD_USERNAME,
      password: process.env.OWNCLOUD_PASSWORD
    });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `healthcheck-${stamp}.txt`;
    const buffer = Buffer.from(`ownCloud healthcheck ${new Date().toISOString()}`, 'utf8');
    const root = (process.env.OWNCLOUD_ROOT || '/tlacove_podklady').replace(/\/+$/, '');
    const folder = `${root}/_health`.replace(/\/+/, '/');
    const pathToFile = `${folder}/${fileName}`.replace(/\/+/, '/');

    const parts = folder.split('/').filter(Boolean);
    let current = '';
    for (const part of parts) {
      current = `${current}/${part}`;
      const exists = await client.exists(current);
      if (!exists) {
        await client.createDirectory(current);
      }
    }

    await client.putFileContents(pathToFile, buffer, { overwrite: true });
    console.log('✅ Upload OK:', { path: pathToFile, url: `${process.env.OWNCLOUD_URL}${pathToFile}` });
  } catch (err) {
    console.error('❌ ownCloud upload failed:', err?.message || err);
    if (err?.response) {
      console.error('Response:', err.response);
    }
  }
}

testOwnCloud();
