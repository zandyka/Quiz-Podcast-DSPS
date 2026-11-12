// server.js - Local Development Server untuk Kopi Ijen Challenge
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const gameHandler = require('./api/game');
const sheetHandler = require('./api/sheet');
const scoresHandler = require('./api/scores');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Adaptasi Vercel Request & Response Helpers
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.json = function (data) {
    this.setHeader('Content-Type', 'application/json');
    this.end(JSON.stringify(data));
  };
  res.send = function (data) {
    this.end(data);
  };

  req.query = parsedUrl.query;

  // Baca body untuk POST/PUT
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk;
  });

  req.on('end', () => {
    if (rawBody) {
      try {
        req.body = JSON.parse(rawBody);
      } catch {
        req.body = rawBody;
      }
    } else {
      req.body = {};
    }

    // Routing API
    if (pathname === '/api/game' || pathname === '/api/game/') {
      return gameHandler(req, res);
    }
    if (pathname === '/api/sheet' || pathname === '/api/sheet/') {
      return sheetHandler(req, res);
    }
    if (pathname === '/api/scores' || pathname === '/api/scores/') {
      return scoresHandler(req, res);
    }

    // Static Files dari /public
    let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        // Fallback ke index.html untuk SPA
        filePath = path.join(PUBLIC_DIR, 'index.html');
      }

      const ext = path.extname(filePath);
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      // Dukungan Range Header untuk Streaming Audio (.mp3, .wav, .ogg)
      const range = req.headers.range;
      if (range && (ext === '.mp3' || ext === '.wav' || ext === '.ogg')) {
        const total = stats.size;
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType
        });

        const stream = fs.createReadStream(filePath, { start, end });
        stream.pipe(res);
        return;
      }

      fs.readFile(filePath, (err, content) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading ' + pathname);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(content);
        }
      });
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`☕ Kopi Ijen Challenge Server Berjalan!`);
  console.log(`Local URL : http://localhost:${PORT}`);
  console.log(`Siap untuk dideploy ke Vercel (vercel deploy)`);
  console.log(`=================================================\n`);
});
