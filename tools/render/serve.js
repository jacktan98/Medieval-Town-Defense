// Shared helper for tools/render: serves the repo root on a free port and opens the game in headless Chromium.
// opts.three: a local three.min.js (r128) served in place of the cdnjs copy.
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../..');
const TYPES = { '.html': 'text/html', '.js': 'application/javascript', '.png': 'image/png', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.json': 'application/json' };

async function openGame(url, opts = {}) {
  const server = http.createServer((req, res) => {
    const file = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' }); fs.createReadStream(file).pipe(res);
  });
  await new Promise(r => server.listen(0, r));
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: opts.viewport || { width: 900, height: 600 } });
  if (opts.three) await page.route('**/three.min.js', r => r.fulfill({ path: path.resolve(opts.three), contentType: 'application/javascript' }));
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto(`http://localhost:${server.address().port}/${url}`);
  await page.waitForFunction(() => typeof window.G === 'function');
  await page.waitForTimeout(opts.settle || 4000);
  return { page, errors, close: async () => { await browser.close(); server.close(); } };
}
module.exports = { openGame };
