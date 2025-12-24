import fs from 'node:fs';
import { promises as fsp } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

export const DIRS = {
  root: ROOT,
  src: path.join(ROOT, 'src'),
  dist: path.join(ROOT, 'dist'),
  public: path.join(ROOT, 'public')
};

export async function build() {
  await cleanDist();
  await copyDir(DIRS.src, DIRS.dist);
  if (fs.existsSync(DIRS.public)) {
    await copyDir(DIRS.public, DIRS.dist);
  }
  console.log(`[build] готово → ${DIRS.dist}`);
}

async function cleanDist() {
  await fsp.rm(DIRS.dist, { recursive: true, force: true });
  await fsp.mkdir(DIRS.dist, { recursive: true });
}

async function copyDir(src, dest) {
  await fsp.mkdir(dest, { recursive: true });
  const entries = await fsp.readdir(src, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
        return;
      }
      if (entry.isFile()) {
        await fsp.copyFile(srcPath, destPath);
      }
    })
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  build().catch((err) => {
    console.error('[build] ошибка', err);
    process.exitCode = 1;
  });
}
