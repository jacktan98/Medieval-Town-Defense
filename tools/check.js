// Syntax check for the game script: node tools/check.js (run before every push; a syntax error stops the whole game loading)
const fs = require('fs'), vm = require('vm'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
try { scripts.forEach((s, i) => new vm.Script(s, { filename: `index.html <script> #${i + 1}` })); console.log(`ok · ${scripts.length} inline script(s)`); }
catch (e) { console.error(e.stack.split('\n').slice(0, 4).join('\n')); process.exit(1); }
