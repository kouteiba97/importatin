// Local preview server for Claude Design .dc.html artboards.
// The .dc.html files load ./support.js, which needs window.React + window.ReactDOM.
// Claude Design's canvas injects those; outside it the page stays blank.
// This server injects them on the fly. Originals are never modified.

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'designs');
const PORT = 4321;

const REACT = [
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js',
];

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function boards() {
  return fs.readdirSync(ROOT)
    .filter((f) => f.endsWith('.dc.html'))
    .sort();
}

function indexPage() {
  const items = boards()
    .map((f) => {
      const name = f.replace(/\.dc\.html$/, '');
      return `<li><a href="/${encodeURIComponent(f)}">${name}</a></li>`;
    })
    .join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Maabar — artboard preview</title>
<style>
  body{margin:0;padding:40px 24px;background:oklch(0.975 0.008 80);
       color:oklch(0.22 0.02 60);font:16px/1.6 system-ui,sans-serif}
  main{max-width:640px;margin:0 auto}
  h1{font-size:22px;font-weight:600;margin:0 0 4px}
  p{margin:0 0 28px;color:oklch(0.48 0.02 60);font-size:14px}
  ul{list-style:none;margin:0;padding:0}
  li{border-bottom:1px solid oklch(0.88 0.012 80)}
  a{display:block;padding:13px 2px;color:inherit;text-decoration:none}
  a:hover{background:oklch(0.95 0.012 80)}
</style></head><body><main>
<h1>Maabar — artboard preview</h1>
<p>${boards().length} artboards. Rendered locally with React injected.</p>
<ul>${items}</ul></main></body></html>`;
}

function inject(html) {
  const tags = REACT.map((s) => `<script src="${s}" crossorigin></script>`).join('\n');
  // support.js must run after React is on window.
  if (html.includes('support.js')) {
    return html.replace(/(<script src="\.\/support\.js"><\/script>)/, `${tags}\n$1`);
  }
  return html.replace(/<\/head>/i, `${tags}\n</head>`);
}

http
  .createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);

    if (url === '/' || url === '/index') {
      res.writeHead(200, { 'Content-Type': TYPES['.html'] });
      return res.end(indexPage());
    }

    const file = path.join(ROOT, path.normalize(url).replace(/^[\\/]+/, ''));
    if (!file.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end('forbidden');
    }

    fs.readFile(file, (err, buf) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': TYPES['.html'] });
        return res.end('not found: ' + url);
      }
      const ext = path.extname(file).toLowerCase();
      const type = TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      res.end(file.endsWith('.dc.html') ? inject(buf.toString('utf8')) : buf);
    });
  })
  .listen(PORT, () => {
    console.log(`Maabar preview: http://localhost:${PORT}`);
    console.log(`Serving ${boards().length} artboards from ${ROOT}`);
  });
