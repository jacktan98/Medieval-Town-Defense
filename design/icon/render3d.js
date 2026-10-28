// Renders the home-screen icon in 3D with the game's own models: the tier-3 castle on a small grassy island with the
// game's low-poly trees, water round it and a dusk sky with a crescent moon. Writes apple-touch-icon.png (180),
// icon-512.png and favicon.png (32) at the repo root.
//   node design/icon/render3d.js [--three path/to/three.min.js]
const path = require('path'), fs = require('fs');
const { openGame } = require('../../tools/render/serve');
const ROOT = path.resolve(__dirname, '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
(async () => {
  const { page, close, errors } = await openGame('index.html?debug&map=meadow', { three: arg('--three'), viewport: { width: 1024, height: 1024 } });
  const out = await page.evaluate(() => G(`(() => {
    const S = new THREE.Scene();
    // dusk sky painted on a canvas: deep blue overhead to warm amber at the horizon, a crescent moon, a few stars
    const c = document.createElement('canvas'); c.width = c.height = 1024; const x = c.getContext('2d');
    const gr = x.createLinearGradient(0, 0, 0, 1024);
    gr.addColorStop(0, '#1b2648'); gr.addColorStop(.38, '#3d4670'); gr.addColorStop(.58, '#c98a5a'); gr.addColorStop(.7, '#f2c26b'); gr.addColorStop(1, '#f2c26b');
    x.fillStyle = gr; x.fillRect(0, 0, 1024, 1024);
    x.fillStyle = '#f6ecd0'; for (const [sx, sy, r] of [[130, 110, 4], [290, 190, 3], [470, 70, 3.5], [900, 330, 3], [80, 300, 2.5], [610, 160, 2.5], [380, 300, 2]]) { x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill(); }
    x.save(); x.beginPath(); x.arc(800, 170, 64, 0, 7); x.clip(); x.fill(); x.fillStyle = gr; x.beginPath(); x.arc(828, 146, 56, 0, 7); x.fill(); x.restore();
    const bg = new THREE.CanvasTexture(c); bg.encoding = THREE.sRGBEncoding; S.background = bg;
    S.fog = new THREE.Fog(new THREE.Color('#c98a5a'), 45, 95);
    S.add(new THREE.HemisphereLight('#c9d6ff', '#4a3d28', .6));
    const sun = new THREE.DirectionalLight('#ffd6a0', 1.4); sun.position.set(-14, 9, 10); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 60 });
    sun.shadow.bias = -.001; sun.shadow.normalBias = .03; S.add(sun);
    // a low-poly green hill, flat on top for the castle, running off to the horizon; grass tones vary by position
    const hill = (px, pz) => { const r = Math.hypot(px, pz * 1.1); return 4.2 * (1 - sstep(4.6, 20, r)) + (fbm(px * .18 + 3, pz * .18) - .5) * 1.2 * sstep(5, 10, r) - .03 * r; };
    const geo = new THREE.PlaneGeometry(120, 120, 140, 140).rotateX(-Math.PI / 2), pos = geo.attributes.position, col = [];
    const gc = new THREE.Color();
    for (let k = 0; k < pos.count; k++) {
      const px = pos.getX(k), pz = pos.getZ(k), rr = Math.hypot(px, pz); pos.setY(k, hill(px, pz) + (rr > 5.2 ? (hash(px * 3.1, pz * 1.7) - .5) * .28 : 0));   // facets for grit
      const n = fbm(px * .25 + 9, pz * .25 + 4); const j = hash(px * 1.9, pz * 2.7); gc.setHSL(.23 + (n - .5) * .06 + (j - .5) * .02, .36 + n * .12, .25 + (n - .5) * .1 + (j - .5) * .05 - Math.min(.07, rr * .002));
      col.push(gc.r, gc.g, gc.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals();
    const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 })); ground.receiveShadow = true; S.add(ground);
    const y0 = hill(0, 0);
    const castle = makeModel('castle', 3, true, 0, 0); castle.position.y = y0; castle.rotation.y = -.42; S.add(castle);
    castle.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    // the game's trees: a cylinder trunk and a six-sided cone crown in the game's greens
    const tm = new THREE.MeshStandardMaterial({ color: '#4d3622', flatShading: true });
    const tree = (tx, tz, s, h) => {
      const cm = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(.27 + (h - .5) * .07, .3 + h * .15, .16 + h * .08), flatShading: true });
      const g = new THREE.Group(); g.add(new THREE.Mesh(trunkGeo, tm), new THREE.Mesh(crownGeo, cm)); g.children.forEach(m => { m.castShadow = m.receiveShadow = true; });
      g.position.set(tx, hill(tx, tz) - .05, tz); g.scale.setScalar(s); g.rotation.y = h * 6; S.add(g);
    };
    for (const t of [[-6.4, -2.0, 1.5, .2], [-8.0, .8, 1.3, .6], [-5.0, -5.6, 1.6, .85], [-9.4, -3.6, 1.7, .4], [-11.4, 2.2, 1.2, .7], [-3.0, -7.6, 1.7, .35],
      [6.6, -2.4, 1.6, .5], [8.4, .6, 1.3, .3], [4.8, -6.0, 1.5, .75], [9.8, -3.8, 1.8, .15], [11.6, 2.8, 1.15, .9], [1.6, -8.2, 1.8, .65],
      [-1.0, -11, 2.0, .1], [-7.5, -9.5, 1.9, .55], [7.5, -9.8, 2.0, .45], [-14, -6, 2.1, .3], [14.5, -6.5, 2.1, .7], [-17, 0, 1.8, .2], [17.5, 0, 1.9, .6], [3.5, -13, 2.1, .25], [-4.5, -14, 2.2, .8]]) tree(...t);
    // rocks (the game's gritty rock), bushes and grass tufts
    for (const [rx, rz, s, a] of [[-5.8, 6.6, 1.1, .3], [-6.9, 7.6, .65, 1.4], [6.2, 7.2, .95, 2.2], [7.2, 6.2, .6, .9], [-10.5, 6.0, .9, 2.6], [10.8, 8.5, .8, 1.1]]) {
      const m = new THREE.Mesh(rockGeo, rockMat); m.position.set(rx, hill(rx, rz) - .1, rz); m.scale.set(s, s * .75, s); m.rotation.set(a, a * 2, a * .5); m.castShadow = m.receiveShadow = true; S.add(m);
    }
    const bushM = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(.25, .35, .2), flatShading: true });
    for (const [bx, bz, s] of [[-4.4, 5.0, 1.2], [4.4, 4.6, 1.0], [-7.8, 6.0, .9], [8.8, 7.4, 1.1], [-1.8, 8.0, .7]]) { const m = new THREE.Mesh(CL[2].geo, bushM); m.position.set(bx, hill(bx, bz) - .05, bz); m.scale.setScalar(s); m.castShadow = true; S.add(m); }
    const tuftM = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(.22, .4, .24), flatShading: true });
    for (let k = 0; k < 140; k++) { const tx = (hash(k, 1.3) - .5) * 30, tz = 2 + hash(k, 7.1) * 14; if (Math.abs(tx) < 3.5 && tz < 5) continue; const m = new THREE.Mesh(CL[0].geo, tuftM); m.position.set(tx, hill(tx, tz) - .02, tz); m.scale.setScalar(.8 + hash(k, 2.2) * .8); m.rotation.y = k; S.add(m); }
    // a worn dirt track from the gate down the hill toward the viewer
    const dirt = new THREE.MeshStandardMaterial({ color: '#7d6a4f', roughness: 1, flatShading: true, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    const fx = Math.sin(-.42), fz = Math.cos(-.42);
    for (let t = 0; t < 1; t += .025) {
      const d = 3.6 + t * 15, px = fx * d + Math.sin(t * 5) * 1.2 * t, pz = fz * d, r = .75 + t * .5 + (hash(t * 40, 2) - .5) * .25;
      const m = new THREE.Mesh(new THREE.CircleGeometry(r, 7).rotateX(-Math.PI / 2), dirt);
      const e = .4, nx = hill(px - e, pz) - hill(px + e, pz), nz = hill(px, pz - e) - hill(px, pz + e);
      m.position.set(px, hill(px, pz) + .16, pz); m.rotation.set(Math.atan2(nz, 2 * e) * -1 * 0 + Math.atan2(-nz, 2 * e) * -1, 0, Math.atan2(nx, 2 * e)); m.receiveShadow = true; S.add(m);
    }
    const cam = new THREE.PerspectiveCamera(32, 1, .1, 200); cam.position.set(0, 9.6, 27.5); cam.lookAt(0, 6.6, 0);
    windU.value = 1.3;
    renderer.setPixelRatio(1); renderer.setSize(1024, 1024, false); renderer.render(S, cam);
    return renderer.domElement.toDataURL('image/png');
  })()`));
  // downscale in the page for smooth resampling
  const files = await page.evaluate(async src => {
    const im = new Image(); im.src = src; await im.decode();
    const o = {}; for (const n of [512, 180, 32]) { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(im, 0, 0, n, n); o[n] = c.toDataURL('image/png').split(',')[1]; }
    return o;
  }, out);
  for (const [n, f] of [[512, 'icon-512.png'], [180, 'apple-touch-icon.png'], [32, 'favicon.png']]) { fs.writeFileSync(path.join(ROOT, f), Buffer.from(files[n], 'base64')); console.log('wrote', f); }
  if (errors.length) console.log('page errors:', errors.slice(0, 5));
  await close();
})();
