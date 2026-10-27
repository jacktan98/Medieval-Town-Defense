const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:844,height:390}});p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(2500);await p.screenshot({path:'land.png'});
await p.evaluate(()=>document.querySelector('#pauseBtn').click());await p.waitForTimeout(300);await p.screenshot({path:'land-paused.png'});await b.close();})();
