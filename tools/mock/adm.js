const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();let errs=0;
for (const [w,h,tag] of [[1100,760,'desk'],[390,800,'phone']]) {
const p=await b.newPage({viewport:{width:w,height:h}});p.on('pageerror',e=>{errs++;console.log('ERR',e.message)});
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(2000);
await p.click('#adminBtn');await p.click('#adFill');await p.check('#adInstant');await p.click('#speedBtn');
console.log(await p.evaluate(()=>{const T=window.T;const ev=T.findValid('house',6,16);const B=T.place('house',ev.ci,ev.cj);const s1=B.built;
 // need a frame to complete
 return 'gold '+T.res.gold+' placedBuiltImmediately '+s1;}));
await p.waitForTimeout(600);
console.log(await p.evaluate(()=>{const T=window.T;const B=T.buildings.find(b=>b.type==='house');const c=T.buildings[0];T.upgrade(B);T.upgrade(c);return 'house built '+B.built;}));
await p.waitForTimeout(600);
console.log(await p.evaluate(()=>{const T=window.T;const B=T.buildings.find(b=>b.type==='house');T.upgrade(B);return 'tiers '+T.buildings.map(b=>b.type+b.tier).join(',');}));
await p.waitForTimeout(600);
console.log(await p.evaluate(()=>'tiers '+window.T.buildings.map(b=>b.type+b.tier).join(',')+' pop '+window.T.villagers.length+' speed '+document.querySelector('#speedBtn').innerText));
await p.screenshot({path:`adm-${tag}.png`});await p.close();}
console.log('errors',errs);await b.close();})();
