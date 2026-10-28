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
    gr.addColorStop(0, '#1d2a4f'); gr.addColorStop(.5, '#4a4a6e'); gr.addColorStop(.78, '#d98a4e'); gr.addColorStop(1, '#f2c26b');
    x.fillStyle = gr; x.fillRect(0, 0, 1024, 1024);
    x.fillStyle = '#f6ecd0'; for (const [sx, sy, r] of [[150, 120, 4], [300, 210, 3], [520, 90, 4], [880, 300, 3], [90, 330, 3], [640, 250, 2.5]]) { x.beginPath(); x.arc(sx, sy, r, 0, 7); x.fill(); }
    x.beginPath(); x.arc(790, 170, 62, 0, 7); x.fill(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(818, 148, 54, 0, 7); x.fill();
    x.globalCompositeOperation = 'destination-over'; x.fillStyle = gr; x.fillRect(0, 0, 1024, 1024);
    const bg = new THREE.CanvasTexture(c); bg.encoding = THREE.sRGBEncoding; S.background = bg;
    S.add(new THREE.HemisphereLight('#c9d6ff', '#4a3d28', .55));
    const sun = new THREE.DirectionalLight('#ffd9a8', 1.35); sun.position.set(-9, 8, 7); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 }); sun.shadow.bias = -.0012; sun.shadow.normalBias = .02; S.add(sun);
    // water and a low-poly island
    // a little diorama: a disc of water with a dark rim, floating in the dusk sky
    const water = new THREE.Mesh(new THREE.CylinderGeometry(8.3, 8.3, .5, 40), [mat('#6b5638'), new THREE.MeshStandardMaterial({ color: '#3d6e86', roughness: .35 }), mat('#6b5638')]);
    water.position.y = -.3; water.receiveShadow = true; S.add(water);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(8.3, 6.8, 1.6, 40), mat('#6b5638')); rim.position.y = -1.35; S.add(rim);
    const grass = mat('#6f9a45'), earth = mat('#7a6448');
    const isl = new THREE.Mesh(new THREE.CylinderGeometry(6.4, 7.4, 1.1, 11), [earth, grass, earth]); isl.position.y = .45; isl.castShadow = isl.receiveShadow = true; S.add(isl);
    const castle = makeModel('castle', 3, true, 0, 0); castle.position.y = 1.0; castle.rotation.y = 0; S.add(castle);
    castle.traverse(o => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
    // the game's trees: a cylinder trunk and a six-sided cone crown, crowns in the game's greens
    const tm = new THREE.MeshStandardMaterial({ color: '#4d3622', flatShading: true });
    for (const [tx, tz, s, h] of [[-4.6, -2.2, 1.25, .12], [-5.2, .6, 1.05, .5], [-3.6, -4.2, 1.1, .8], [4.4, -3.0, 1.2, .3], [5.3, -.4, 1.0, .65], [2.4, -4.9, 1.15, .9], [-1.2, -5.3, .95, .2], [-6.0, 2.6, .8, .4]]) {
      const cm = new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(.27 + (h - .5) * .07, .3 + h * .15, .17 + h * .07), flatShading: true });
      const g = new THREE.Group(); g.add(new THREE.Mesh(trunkGeo, tm), new THREE.Mesh(crownGeo, cm)); g.children.forEach(m => { m.castShadow = m.receiveShadow = true; });
      g.position.set(tx, 1.0, tz); g.scale.setScalar(s); g.rotation.y = h * 6; S.add(g);
    }
    const cam = new THREE.PerspectiveCamera(30, 1, .1, 200); cam.fov = 25; cam.updateProjectionMatrix(); cam.position.set(25, 15.5, 29.5); cam.lookAt(0, .9, 0);
    windU.value = 1.3;
    renderer.setPixelRatio(1); renderer.setSize(1024, 1024, false); renderer.render(S, cam);
    const big = renderer.domElement.toDataURL('image/png');
    return big;
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
