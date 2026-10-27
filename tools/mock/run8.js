const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let errs=0;p.on('pageerror',e=>{errs++;if(errs<5)console.log('ERR',e.message,e.stack.split('\n').slice(1,3).join('|'))});
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(3000);await p.click('#nightBtn');await p.waitForTimeout(8000);
console.log(await p.evaluate(()=>document.querySelector('#phaseText').innerText),'errors',errs);await b.close();})();
