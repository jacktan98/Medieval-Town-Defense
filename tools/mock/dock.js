const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();for (const [w,h,n] of [[390,800,'dock-phone.png'],[1200,800,'dock-desk.png']]){const p=await b.newPage({viewport:{width:w,height:h}});
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(1500);await (await p.$('.dock')).screenshot({path:n});await p.close();}await b.close();})();
