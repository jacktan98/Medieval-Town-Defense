const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:800}});let errs=0;p.on('pageerror',e=>{errs++;if(errs<5)console.log('ERR',e.message)});
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(2000);
const t1=await p.evaluate(()=>document.querySelector('#phaseSub').innerText);
await p.click('#pauseBtn');await p.waitForTimeout(3000);const t2=await p.evaluate(()=>document.querySelector('#phaseSub').innerText);
await p.click('#pauseBtn');await p.waitForTimeout(2000);const t3=await p.evaluate(()=>document.querySelector('#phaseSub').innerText);
const r=await p.evaluate(()=>{const a=document.querySelector('.panel').getBoundingClientRect(),b=document.querySelector('#pauseBtn').getBoundingClientRect(),d=document.querySelector('.dock').getBoundingClientRect();return {panelRight:a.right,pauseLeft:b.left,dockH:d.height};});
console.log(t1,'|',t2,'|',t3,JSON.stringify(r),'errors',errs);await b.close();})();
