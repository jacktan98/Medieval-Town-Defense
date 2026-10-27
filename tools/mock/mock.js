(function(){
function mk(){ const store={}; const f=function(){};
 return new Proxy(f,{ get(t,p){ if(p===Symbol.iterator) return function*(){}; if(p===Symbol.toPrimitive) return ()=>0; if(p==='then') return undefined; if(p==='length') return 0;
   if(p in store) return store[p]; const c=mk(); store[p]=c; return c; },
   set(t,p,v){ store[p]=v; return true; }, apply(){ return mk(); }, construct(){ return mk(); } }); }
window.THREE = mk();
})();
