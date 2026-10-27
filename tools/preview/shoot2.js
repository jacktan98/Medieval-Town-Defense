const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1000}});
p.on('pageerror',e=>console.log('ERR',e.message,e.stack.split('\n').slice(1,3).join('|')));
await p.goto('file://'+process.cwd()+'/farm.html');await p.waitForTimeout(800);
await (await p.$('#a')).screenshot({path:'farm-tiers.png'});
await b.close();})();
