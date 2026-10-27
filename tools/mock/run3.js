const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:800}});
let errs=0;p.on('pageerror',e=>{errs++; if(errs<6) console.log('PAGEERR',e.message, e.stack.split('\n').slice(0,3).join(' | '))});
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{ const T=window.T; T.res.gold=999;T.res.wood=999;T.res.stone=999;T.res.food=99;
  const near=T.trees.filter(t=>Math.hypot(t.x-19,t.z-27)<15).length, rk=T.rocks.filter(r=>Math.hypot(r.x-19,r.z-27)<12).length;
  const hs=[]; for(const [a,b] of [[5,16],[6,16],[12,16],[13,16]]) hs.push(T.place('house',a,b));
  for(let a=5;a<14;a++) T.paintRoad(a,17);
  T.place('statue',9,17); T.place('well',7,18); T.place('torch',11,18); T.place('flowers',8,19);
  return 'trees<15m '+near+' rocks<12m '+rk+' clutter '+T.clutter.length+' houses '+hs.filter(Boolean).length+' charm '+T.buildings.filter(b=>b.type==='house').map(b=>T.charmOf(b).toFixed(2)).join(',');
}));
const samp=async()=>p.evaluate(()=>{const v=window.T.villagers; return v.length+' vis '+v.filter(x=>x.g.visible!==false && !x.inside && !(x.hideT>0)).length+' hidden '+v.filter(x=>x.hideT>0).length;});
for(let i=0;i<4;i++){ await p.waitForTimeout(8000); console.log('day', await samp()); }
console.log(await p.evaluate(()=>document.querySelector('#log').innerText.replace(/\n/g,' / ').slice(0,300)));
await p.click('#nightBtn'); await p.waitForTimeout(5000); console.log('night', await samp());
await p.waitForTimeout(30000); console.log(await p.evaluate(()=>document.querySelector('#phaseText').innerText)); console.log('dawn', await samp());
console.log('errors',errs); await b.close();})();
