const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();let errs=0;
for (const [w,h,tag] of [[390,800,'phone'],[1100,760,'desk']]) {
 const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>{errs++;console.log('ERR',e.message)});
 await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(2500);
 await p.evaluate(()=>window.T.select(window.T.buildings[0]));await p.waitForTimeout(400);
 await (await p.$('.dock')).screenshot({path:`ui-dock-${tag}.png`});
 await p.click('#pauseBtn');await p.waitForTimeout(300);await p.screenshot({path:`ui-paused-${tag}.png`});
 await p.close();}
console.log('errors',errs);await b.close();})();
