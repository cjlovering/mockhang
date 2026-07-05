// Zero-dependency static server with live reload for Art Placer.
// Serves this directory and injects a tiny SSE snippet into index.html so the
// browser reloads whenever any project file changes. No npm install needed.
//   node dev-server.js         (PORT env var overrides the default)
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 5173;
const clients = [];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.css': 'text/css', '.ico': 'image/x-icon',
};

const RELOAD_SNIPPET = `<script>
(function(){try{var es=new EventSource('/__livereload');
es.onmessage=function(e){if(e.data==='reload')location.reload();};}catch(e){}})();
</script>`;

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);

  if (urlPath === '/__livereload') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('retry: 1000\n\n');
    clients.push(res);
    req.on('close', () => { const i = clients.indexOf(res); if (i >= 0) clients.splice(i, 1); });
    return;
  }

  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('404 Not Found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' };
    let body = data;
    if (ext === '.html') body = Buffer.from(data.toString('utf8').replace('</body>', RELOAD_SNIPPET + '</body>'));
    res.writeHead(200, headers);
    res.end(body);
  });
});

let debounce = null;
try {
  fs.watch(ROOT, { recursive: true }, (_evt, file) => {
    if (file && (file.startsWith('.git') || file.startsWith('node_modules') || file.endsWith('.devserver.log'))) return;
    clearTimeout(debounce);
    debounce = setTimeout(() => { clients.forEach((c) => c.write('data: reload\n\n')); }, 120);
  });
} catch (e) {
  console.warn('file watch unavailable — live reload disabled:', e.message);
}

server.listen(PORT, () => {
  console.log('Art Placer dev server → http://localhost:' + PORT + '  (live reload on)');
});
