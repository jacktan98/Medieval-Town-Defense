const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(1500);
const q=s=>p.evaluate(s=>{const e=document.querySelector(s);e.click();},s);
await q('#pauseBtn');await p.waitForTimeout(200);const a=await p.evaluate(()=>document.querySelector('#pausedTag').hidden);
await q('#reset');const t1=await p.evaluate(()=>document.querySelector('#reset').innerText);
await q('#reset');await p.waitForTimeout(300);const t2=await p.evaluate(()=>[document.querySelector('#reset').innerText,document.querySelector('#pausedTag').hidden]);
console.log(a,t1,t2);await b.close();})();
