import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { build, DIRS } from './build.js';

const PORT = process.env.PORT || 4173;
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

let rebuilding = false;
let queued = false;

start();

async function start() {
  await runBuild();
  watchSources();
  startServer();
}

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const requested = urlPath === '/' ? '/index.html' : urlPath;
    // Safe path joining
    const safeRequested = requested.replace(/^(\.\.[/\\])+/, '');
    let filePath = path.join(DIRS.dist, safeRequested.startsWith('/') ? safeRequested.slice(1) : safeRequested);

    if (filePath.endsWith(path.sep)) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        return streamFile(filePath, res);
      }

      // Check for clean URL (e.g. /about -> /about.html)
      if (err && !path.extname(filePath)) {
        const fallback = path.join(DIRS.dist, 'index.html');
        // Check if fallback exists before serving
        if (fs.existsSync(fallback)) {
          return streamFile(fallback, res);
        }
      }

      console.log(`[404] ${req.url} -> ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found: ' + req.url);
    });
  });

  server.listen(PORT, () => {
    console.log(`[dev] слушаю http://localhost:${PORT}`);
  });
}

function streamFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
  });
  fs.createReadStream(filePath).pipe(res);
}

function watchSources() {
  [DIRS.src, DIRS.public].forEach((dir) => {
    if (!fs.existsSync(dir)) return;
    try {
      fs.watch(dir, { recursive: true }, () => {
        queueBuild();
      });
    } catch {
      // recursive watch может быть не поддержан — откатываемся на обычный.
      fs.watch(dir, () => queueBuild());
    }
  });
}

function queueBuild() {
  if (queued) return;
  queued = true;
  setTimeout(() => {
    queued = false;
    runBuild();
  }, 120);
}

async function runBuild() {
  if (rebuilding) {
    queued = true;
    return;
  }
  rebuilding = true;
  try {
    await build();
  } catch (err) {
    console.error('[dev] ошибка сборки', err);
  } finally {
    rebuilding = false;
  }
}
