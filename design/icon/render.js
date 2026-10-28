// Renders design/icon/icon.svg to the home-screen icon (apple-touch-icon.png 180), icon-512.png and favicon.png (32) at the repo root.
//   node design/icon/render.js
const { chromium } = require('playwright'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
(async () => {
  const svg = fs.readFileSync(path.join(__dirname, 'icon.svg'), 'utf8');
  const b = await chromium.launch(), p = await b.newPage();
  for (const [n, out] of [[180, 'apple-touch-icon.png'], [512, 'icon-512.png'], [32, 'favicon.png']]) {
    await p.setViewportSize({ width: n, height: n });
    await p.setContent(`<style>html,body{margin:0}svg{display:block;width:${n}px;height:${n}px}</style>` + svg);
    await p.screenshot({ path: path.join(ROOT, out) }); console.log('wrote', out);
  }
  await b.close();
})();
