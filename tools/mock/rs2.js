const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(1500);
await p.click('#pauseBtn');await p.waitForTimeout(200);
console.log(await p.evaluate(()=>{const t=document.querySelector('#pausedTag');const r=document.querySelector('#reset').getBoundingClientRect();return [t.hidden,getComputedStyle(t).display,JSON.stringify(r),document.querySelector('.pauseCard').outerHTML.slice(0,300)];}));
await b.close();})();
