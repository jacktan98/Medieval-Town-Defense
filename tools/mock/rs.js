const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let errs=0;p.on('pageerror',e=>{errs++;console.log('ERR',e.message)});
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(1500);
await p.click('#pauseBtn');await p.waitForTimeout(300);await p.click('#reset');const t1=await p.evaluate(()=>document.querySelector('#reset').innerText);
await p.click('#reset');await p.waitForTimeout(500);const t2=await p.evaluate(()=>[document.querySelector('#reset').innerText,document.querySelector('#pausedTag').hidden]);
console.log(t1,'|',t2,'errors',errs);await b.close();})();
