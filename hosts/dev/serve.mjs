// A static server for the repository root, so index.html can load /app/dist/… and ./dist/… Nothing more: it is
// for the dev host and its tests. `node serve.mjs` serves on http://127.0.0.1:4173/hosts/dev/.

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function handle(request, response) {
  let url;
  let pathname;
  try {
    url = new URL(request.url, 'http://localhost');
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain' }).end('Bad request: malformed URL');
    return;
  }
  let file = path.normalize(path.join(root, pathname));
  if (!file.startsWith(root + path.sep) && file !== root) {
    response.writeHead(403).end();
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!url.pathname.endsWith('/')) {
      response.writeHead(302, { Location: url.pathname + '/' + url.search }).end();
      return;
    }
    file = path.join(file, 'index.html');
  }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404, { 'Content-Type': 'text/plain' }).end(`Not found: ${url.pathname}`);
    return;
  }
  // Send the headers once the file is open, so a read that fails (a file webpack --watch just replaced, say)
  // answers 500 instead of taking the server down.
  const stream = fs.createReadStream(file);
  stream.on('open', () => {
    response.writeHead(200, {
      'Content-Type': types[path.extname(file)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
  });
  stream.on('error', () => {
    if (response.headersSent) {
      response.destroy();
    } else {
      response.writeHead(500, { 'Content-Type': 'text/plain' }).end(`Could not read: ${url.pathname}`);
    }
  });
  stream.pipe(response);
}

/** Starts the server on 127.0.0.1. Port 0 picks a free one. Resolves with the server and its base URL. */
export function startServer(port = 0) {
  return new Promise((resolve) => {
    const server = http.createServer(handle);
    server.listen(port, '127.0.0.1', () => {
      const url = `http://127.0.0.1:${server.address().port}/`;
      resolve({ server, url });
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { url } = await startServer(Number(process.env.PORT ?? 4173));
  console.log(`Stronghold dev host: ${url}hosts/dev/`);
}
