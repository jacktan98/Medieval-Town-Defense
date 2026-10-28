// Movement check: a busy town for 60 s, counting how often villagers visibly shake, and whether every building site gets built.
//   node tools/render/motion.js [--three path/to/three.min.js] [--secs 60]
// "rapid" counts a villager's drawn position reversing direction twice within a second (shaking); a handful in a minute is
// normal (turning back at a destination), dozens means jitter. Headless Chromium has no GPU and runs at a few frames a
// second, so compare numbers between builds rather than reading them as absolute.
const { openGame } = require('./serve');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

(async () => {
  const { page, close, errors } = await openGame('index.html?debug', { three: arg('--three'), viewport: { width: 260, height: 200 } });
  await page.evaluate(() => G(`try { localStorage['mtd-guide'] = 'done'; } catch (e) {}
    res.gold = res.wood = res.stone = res.food = 9999; for (let i = 0; i < 8; i++) makeVillager(castleB());
    const C = castleB(), ci = C.ev.ci, cj = C.ev.cj;
    for (const [t, a, b] of [['house', ci + 3, cj], ['house', ci + 3, cj + 1], ['lodge', ci - 3, cj - 3], ['farm', ci + 4, cj + 3], ['quarry', ci - 2, cj + 3]]) place(t, a, b, {});
    window.J = { rev: 0, rapid: 0, moves: 0, last: new Map() };
    (function tick() {
      for (const v of villagers) {
        if (!v.g.visible) { J.last.delete(v); continue; }
        const x = v.g.position.x, z = v.g.position.z, L = J.last.get(v);
        if (!L) { J.last.set(v, { x, z }); continue; }
        const dx = x - L.x, dz = z - L.z, m = Math.hypot(dx, dz);
        if (m <= .004) { J.last.set(v, { ...L, x, z }); continue; }
        J.moves++;
        if (L.dx !== undefined && dx * L.dx + dz * L.dz < -.3 * m * L.m) { J.rev++; const t = performance.now(); if (v.lastRev && t - v.lastRev < 1000) J.rapid++; v.lastRev = t; }
        J.last.set(v, { x, z, dx, dz, m });
      }
      requestAnimationFrame(tick);
    })(); 0`));
  await page.waitForTimeout(+arg('--secs', 60) * 1000);
  console.log(await page.evaluate(() => G(`'moves ' + J.moves + ' · reversals ' + J.rev + ' · rapid ' + J.rapid +
    ' · sites built ' + buildings.filter(B => B.built).length + '/' + buildings.length +
    (buildings.some(B => B.site) ? ' (still building: ' + buildings.filter(B => B.site).map(B => B.type + ' ' + (B.site.progress * 100 | 0) + '%').join(', ') + ')' : '')`)));
  if (errors.length) console.log('page errors:', errors.slice(0, 5));
  await close();
})();
