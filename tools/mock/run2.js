const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1200,height:800}});
let errs=0;p.on('pageerror',e=>{errs++; if(errs<6) console.log('PAGEERR',e.message, e.stack.split('\n').slice(0,3).join(' | '))});
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{
  const T=window.T, out=[]; T.res.gold=999;T.res.wood=999;T.res.stone=999;T.res.food=99;
  const c=T.buildings[0]; out.push('castle '+c.ev.ci+','+c.ev.cj);
  for(const t of ['house','farm','lodge','quarry','tower','gate','well','torch','flowers','statue']){ const ev=T.findValid(t,4,4); out.push(t+':'+(ev?(T.place(t,ev.ci,ev.cj)?'ok':'fail'):'noSpot')); }
  // wall line next to castle
  for(let a=4;a<8;a++) T.paintWall(a,20); T.endStroke();
  const walls=T.buildings.filter(b=>b.type==='wall').map(b=>b.mask); out.push('wallmasks '+walls);
  for(const B of T.buildings.slice()) { T.upgrade(B); T.upgrade(B); }
  out.push('tiers '+T.buildings.map(b=>b.type[0]+b.tier).join(' '));
  const h=T.buildings.find(b=>b.type==='house'); T.removeBuilding(h,false);
  out.push('count '+T.buildings.length+' vill '+T.villagers.length);
  return out.join(' | ');
}));
await p.click('#nightBtn'); await p.waitForTimeout(30000);
console.log(await p.evaluate(()=>document.querySelector('#phaseText').innerText+' '+document.querySelector('#phaseSub').innerText+' | '+document.querySelector('#log').innerText.replace(/\n/g,' / ').slice(0,400)));
console.log('errors',errs);
await b.close();})();
