const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let errs=0;p.on('pageerror',e=>{errs++;if(errs<5)console.log('ERR',e.message,e.stack.split('\n').slice(1,3).join('|'))});
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(1500);
const st=()=>p.evaluate(()=>{const T=window.T;const ps=T.popStats();return 'pop '+ps.total+' idle '+ps.idle+' builders '+T.villagers.filter(v=>v.build).length+' sites '+T.buildings.filter(b=>b.site).map(b=>b.type+Math.floor(b.site.progress*100)).join(',')+' built '+T.buildings.filter(b=>b.built).map(b=>b.type).join(',')+' wood '+T.stats.wood+' stone '+T.stats.stone;});
console.log(await p.evaluate(()=>{const T=window.T;Object.assign(T.res,{gold:999,wood:999,stone:999,food:99});const o=[];
 for(const [t,a,b] of [['house',6,14],['house',12,17],['lodge',14,6],['quarry',4,8],['tower',12,10]]){const ev=T.findValid(t,a,b);o.push(t+(ev&&T.place(t,ev.ci,ev.cj)?'+':'-'));}return o.join(' ');}));
for(let i=0;i<5;i++){await p.waitForTimeout(10000);console.log(await st());}
await p.evaluate(()=>{const T=window.T;const h=T.buildings.find(b=>b.type==='house');T.upgrade(h);});
await p.waitForTimeout(12000);console.log('after upg',await st(), await p.evaluate(()=>window.T.buildings.filter(b=>b.type==='house').map(b=>b.tier).join()));
await p.click("#nightBtn");await p.waitForTimeout(4000);for(let i=0;i<4;i++){await p.waitForTimeout(5000);console.log(await p.evaluate(()=>window.T.villagers.filter(v=>!v.post).map(v=>(v.inside?"IN":"out")+":"+v.x.toFixed(1)+","+v.z.toFixed(1)+" st"+v.stuck.toFixed(1)+" path"+(v.path?v.path.length:"-")).join(" | ")));}
console.log('night',await p.evaluate(()=>{const T=window.T;return 'manned '+T.buildings.filter(b=>b.manned).map(b=>b.type+':'+b.manned.filter(Boolean).length).join(',')+' sheltered '+T.villagers.filter(v=>v.inside).length+' of '+T.villagers.length;}));
console.log(await p.evaluate(()=>document.querySelector('#log').innerText.split('\n').slice(0,3).join(' / ')));
console.log('errors',errs);await b.close();})();
