const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let errs=0;p.on('pageerror',e=>errs++);
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>[8,12,15,20].map(r=>r+'m:'+window.T.trees.filter(t=>Math.hypot(t.x-19,t.z-27)<r).length).join(' ')+' total '+window.T.trees.length),'errors',errs);await b.close();})();
