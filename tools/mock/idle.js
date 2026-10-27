const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let errs=0;p.on('pageerror',e=>{errs++;console.log('ERR',e.message)});
await p.goto('file://'+process.cwd()+'/test.html');
const pos=()=>p.evaluate(()=>window.T.villagers.map(v=>v.x.toFixed(1)+','+v.z.toFixed(1)+(v.g.visible===false?'(in)':'')).join(' '));
await p.waitForTimeout(400);const a=await pos();await p.waitForTimeout(2000);const b2=await pos();await p.waitForTimeout(4000);const c=await pos();
console.log(a,'|',b2,'|',c);
await p.evaluate(()=>{const T=window.T;Object.assign(T.res,{gold:999,wood:999,stone:999});const ev=T.findValid('farm',6,16);T.place('farm',ev.ci,ev.cj);});
await p.waitForTimeout(20000);
console.log(await p.evaluate(()=>window.T.villagers.map(v=>(v.job?v.job.type:'-')+(v.build?'B':'')).join(' ')),'errors',errs);await b.close();})();
