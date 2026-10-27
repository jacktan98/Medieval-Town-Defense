const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:1000}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/gallery.html');await p.waitForTimeout(800);
await (await p.$('#a')).screenshot({path:'buildings-economy.png'});await (await p.$('#b')).screenshot({path:'buildings-defences-decor.png'});
await b.close();})();
