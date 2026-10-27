const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();let errs=0;p.on('pageerror',e=>{errs++;if(errs<4)console.log('ERR',e.message)});
await p.goto('file://'+process.cwd()+'/test.html');await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>{const T=window.T;Object.assign(T.res,{gold:9999,wood:9999,stone:9999,food:999});const o=[];
 // a row of houses + walls as obstacles between castle and resources
 for (let a=4;a<16;a++){ if(a%3) {const ev=T.evaluate('house',a,10); if(ev.ok) T.place('house',a,10);} }
 for (let a=3;a<10;a++) T.paintWall(a,8); T.endStroke();
 for (const [t,a,b] of [['lodge',8,3],['quarry',4,4],['farm',13,16],['house',6,16],['house',12,13],['tower',15,9]]) { const ev=T.findValid(t,a,b); o.push(t+(ev&&T.place(t,ev.ci,ev.cj)?'+':'-')); }
 return o.join(' ')+' buildings '+T.buildings.length;}));
for(let i=0;i<7;i++){await p.waitForTimeout(15000);console.log(await p.evaluate(()=>{const T=window.T;return 't'+' sites '+T.buildings.filter(b=>b.site).length+' pop '+T.villagers.length+' wood '+T.stats.wood+' stone '+T.stats.stone+' unstick '+(window.UNSTICK||0)+' maxStuck '+Math.max(...T.villagers.map(v=>v.stuck||0)).toFixed(1);}));}
console.log(await p.evaluate(()=>window.T.villagers.filter(v=>v.job).map(v=>v.job.type+":"+v.state+(v.hungry?"H":"")+(v.build?"B":"")+" d"+Math.hypot(v.x-(v.job.ev.x0+v.job.ev.x1)/2,v.z-(v.job.ev.z0+v.job.ev.z1)/2).toFixed(0)).join(" | ")));console.log("errors",errs);await b.close();})();
