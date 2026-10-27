const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let errs=0;p.on('pageerror',e=>{errs++;if(errs<5)console.log('ERR',e.message,e.stack.split('\n')[1])});
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const T=window.T;Object.assign(T.res,{gold:999,wood:999,stone:999,food:99});
 const out=[];for(const [t,a,b] of [['quarry',4,8],['lodge',14,6],['house',6,14],['house',12,17],['tower',12,10],['tower',6,11],['farm',4,17]]){const ev=T.findValid(t,a,b);out.push(t+(ev&&T.place(t,ev.ci,ev.cj)?'+':'-'));}
 const pth=T.findPath(5,5,40,50,0); return out.join(' ')+' path '+(pth?pth.length:'null')+' vill '+T.villagers.length;}));
const prog=()=>p.evaluate(()=>{const T=window.T;return 'wood '+T.stats.wood+' stone '+T.stats.stone+' stuck>3: '+T.villagers.filter(v=>v.stuck>3).length;});
await p.waitForTimeout(25000); console.log('day', await prog());
await p.click('#nightBtn'); await p.waitForTimeout(12000);
console.log('night', await p.evaluate(()=>{const T=window.T;return 'posted '+T.villagers.filter(v=>v.posted).length+'/'+T.villagers.filter(v=>v.post).length+' manned '+T.buildings.filter(b=>b.manned).map(b=>b.type+':'+b.manned.filter(Boolean).length).join(',')+' slain '+T.stats.slain;}));
console.log(await p.evaluate(()=>document.querySelector('#log').innerText.split('\n').slice(0,2).join(' / ')));
await p.waitForTimeout(40000); console.log(await p.evaluate(()=>document.querySelector('#phaseText').innerText+' slain '+window.T.stats.slain+' posted '+window.T.villagers.filter(v=>v.posted).length));
console.log('errors',errs);await b.close();})();
