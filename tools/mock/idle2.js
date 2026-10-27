const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(3000);
console.log(await p.evaluate(()=>window.T.villagers.map(v=>JSON.stringify({vis:v.g.visible,hideT:v.hideT,inside:v.inside,sleeping:v.sleeping,hungry:v.hungry,wait:v.wait,state:v.state,tx:v.tx,x:v.x,fresh:v.fresh,stuck:v.stuck})).join('\n')));await b.close();})();
