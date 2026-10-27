function hash(x, y) { const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return h - Math.floor(h); }
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)); const lerp = (a, b, t) => a + (b - a) * t;
const N = 28, CELL = 2; const windU={value:0};
const DIRS = [[0, -1, 1], [1, 0, 2], [0, 1, 4], [-1, 0, 8]];
const DEF = {
  house:  { size: 1, name: 'House', maxdh: 1.4, hp: [100, 150, 220], cost: { wood: 15 },
            up: [{ wood: 25, gold: 20 }, { wood: 30, stone: 20, gold: 40 }], gold: [2, 4, 6], residents: [2, 3, 4],
            tiers: ['Hovel', 'Cottage', 'Townhouse'], key: '1' },
  farm:   { size: 2, name: 'Farm', maxdh: 1.6, hp: [90, 130, 180], cost: { wood: 15 },
            up: [{ wood: 20, gold: 20 }, { wood: 30, stone: 15, gold: 35 }], food: [4, 6, 9], workers: [1, 1, 2],
            tiers: ['Plot', 'Croft', 'Manor farm'], key: '2' },
  lodge:  { size: 2, name: 'Lumber camp', maxdh: 1.8, hp: [120, 170, 240], cost: { gold: 20 },
            up: [{ gold: 45, stone: 10 }, { gold: 75, stone: 25 }], reach: 14, workers: [2, 3, 4],
            tiers: ['Lumber shack', 'Lumber camp', 'Lumber yard'], key: '3' },
  quarry: { size: 2, name: 'Quarry', maxdh: 2.2, hp: [140, 200, 280], cost: { gold: 25, wood: 10 },
            up: [{ gold: 45, wood: 20 }, { gold: 75, wood: 30 }], reach: 16, workers: [2, 3, 4],
            tiers: ['Stone pit', 'Quarry', "Masons' yard"], key: '4' },
  tower:  { size: 1, name: 'Archer tower', maxdh: 1.8, hp: [180, 280, 400], cost: { wood: 15, gold: 10 }, noRoad: true,
            up: [{ wood: 30, gold: 30 }, { stone: 40, gold: 60 }], range: [11, 13, 15], dmg: [7, 9, 12], rate: [1.2, 1.0, .8],
            archers: [2, 2, 2], shootY: [3.4, 3.8, 5.4], tiers: ['Lookout', 'Watchtower', 'Stone tower'], key: '5' },
  wall:   { size: 1, name: 'Wall', maxdh: 1.8, falloff: 1.5, hp: [200, 350, 500], cost: { wood: 5, gold: 2 }, noRoad: true, paint: true,
            up: [{ stone: 6, gold: 3 }, { stone: 10, gold: 10 }], tiers: ['Palisade', 'Stone wall', 'Battlement'], key: '6' },
  gate:   { size: 1, name: 'Gate', maxdh: 1.6, falloff: 1.5, hp: [250, 400, 600], cost: { wood: 15, gold: 10 }, noRoad: true,
            up: [{ stone: 15, gold: 20 }, { stone: 25, gold: 35 }], tiers: ['Timber gate', 'Stone gate', 'Gatehouse'], key: '7' },
  castle: { size: 3, name: 'Castle', maxdh: 2.6, hp: [900, 1200, 1600], cost: {}, gold: [3, 5, 7],
            up: [{ stone: 60, wood: 40, gold: 70 }, { stone: 100, gold: 100 }], range: [13, 15, 17], dmg: [11, 15, 20], rate: [1.3, 1.15, 1.0],
            archers: [4, 4, 4], shootY: [3.2, 4.6, 5.2], residents: [3, 3, 3], tiers: ['Palisade fort', 'Stone keep', 'Castle'] },
  well:    { size: 1, name: 'Well', decor: true, maxdh: 1.3, falloff: 1.2, hp: [80], cost: { stone: 5 }, tiers: ['Well'], noRoad: true },
  torch:   { size: 1, name: 'Torch', decor: true, maxdh: 1.6, falloff: 1, hp: [40], cost: { wood: 2 }, tiers: ['Torch post'], noRoad: true },
  flowers: { size: 1, name: 'Flower bed', decor: true, maxdh: 1.2, falloff: 1, hp: [40], cost: { gold: 3 }, tiers: ['Flower bed'], noRoad: true },
  statue:  { size: 1, name: 'Statue', decor: true, maxdh: 1.2, falloff: 1.2, hp: [150], cost: { stone: 12, gold: 10 }, tiers: ['Statue'], noRoad: true },
};
const MEAL = 20, LUMBER_LOAD = 2;
DEF.castle.food = [3, 4, 5];
const BUILD_T = { house: 10, farm: 10, lodge: 12, quarry: 14, tower: 14, wall: 3, gate: 8, castle: 24, well: 5, torch: 3, flowers: 3, statue: 8 };
for (const t in BUILD_T) DEF[t].build = BUILD_T[t];
DEF.well.charm = .25; DEF.torch.charm = .1; DEF.flowers.charm = .15; DEF.statue.charm = .35;
const PATH_COST = { gold: 1 }, PATH_CHARM = .02, CHARM_R = 8, WALK = { farm: 1, torch: 1, flowers: 1 };
const CATS = { eco: ['house', 'farm', 'lodge', 'quarry'], def: ['tower', 'wall', 'gate'], decor: ['road', 'well', 'torch', 'flowers', 'statue'] };
const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: .9, flatShading: true });
const M = { plaster: mat('#dccba2'), timber: mat('#5a3d27'), roof: mat('#8d4a2c'), stone: mat('#8a857a'),
  wood: mat('#7b5a37'), rough: mat('#6a5038'), dark: mat('#2a2018'), flag: mat('#b8392a'), stone2: mat('#a39d8f'), court: mat('#7d6a4f'),
  log: mat('#6e4b2c'), logEnd: mat('#c9a271'), thatch: mat('#b39446'), thatchOld: mat('#8a7542'), tile: mat('#9b4a2e'), mud: mat('#8a7350'),
  iron: mat('#5d6064'), soil: mat('#5e4630'), crop1: mat('#6f8f3a'), crop2: mat('#93a246'), wheat: mat('#d1b45a'), hay: mat('#c9ab55'),
  canvas: mat('#cfc2a0'), banner: mat('#2f4f8a'), leaf: mat('#4f7a32') };
M.glow = new THREE.MeshStandardMaterial({ color: '#3a2a18', emissive: new THREE.Color('#ffb347'), emissiveIntensity: .1, roughness: .8 });
M.flame = new THREE.MeshStandardMaterial({ color: '#ffd27a', emissive: new THREE.Color('#ff8a2a'), emissiveIntensity: 1, roughness: .5 });
M.water = new THREE.MeshStandardMaterial({ color: '#2f5560', roughness: .2 });
// stone surfaces get running-bond masonry: darker mortar joints and slightly varied blocks
const masonry = sh => {
  sh.vertexShader = 'varying vec3 vMP; varying vec3 vMN;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    vMP = (modelMatrix * vec4(transformed, 1.0)).xyz; vMN = normalize(mat3(modelMatrix) * objectNormal);`);
  sh.fragmentShader = `varying vec3 vMP; varying vec3 vMN;
    float mh(vec2 p) { return fract(sin(dot(p, vec2(41.3, 289.1))) * 15731.7); }
  ` + sh.fragmentShader.replace('#include <color_fragment>', `#include <color_fragment>
    vec3 an = abs(vMN);
    vec2 q = an.y > .65 ? vMP.xz * vec2(2.2, 2.2) : (an.x > an.z ? vMP.zy : vMP.xy) * vec2(2.3, 3.4);
    q.x += mod(floor(q.y), 2.0) * .5;
    vec2 cf = fract(q), ci = floor(q);
    float j = max(1.0 - smoothstep(.0, .07, min(cf.x, 1.0 - cf.x)), 1.0 - smoothstep(.0, .1, min(cf.y, 1.0 - cf.y)));
    float blk = .84 + .3 * mh(ci) - .08 * smoothstep(.55, 1.0, cf.y);
    diffuseColor.rgb *= mix(blk, .5, j);`);
};
M.stone.onBeforeCompile = masonry; M.stone2.onBeforeCompile = masonry;
M.drape = mat('#2f4f8a');
M.drape.onBeforeCompile = sh => {
  sh.uniforms.uTime = windU;
  sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    float dph = modelMatrix[3].x * .9 + modelMatrix[3].z * .5, du = clamp(.5 - transformed.y * 1.1, 0.0, 1.0);
    transformed.z += (sin(uTime * 2.6 - du * 5.0 + dph) * .05 + .02) * du;
    transformed.x += sin(uTime * 1.9 - du * 3.0 + dph) * .015 * du;`);
};
// flags and banners ripple: the edge nearest the pole stays put, the free edge moves most
for (const fm of [M.flag, M.banner]) fm.onBeforeCompile = sh => {
  sh.uniforms.uTime = windU;
  sh.vertexShader = 'uniform float uTime;\n' + sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
    float fph = modelMatrix[3].x * .7 + modelMatrix[3].z * .4, fu = clamp(transformed.x * 1.4 + .5, 0.0, 1.0);
    transformed.z += sin(uTime * 5.0 - fu * 6.0 + fph) * .07 * fu + sin(uTime * 8.3 - fu * 9.0 + fph) * .02 * fu;
    transformed.y += sin(uTime * 3.1 - fu * 4.0 + fph) * .025 * fu;`);
};
const FLOWER = ['#d4483b', '#f0c84a', '#9a5ad0', '#f2efe6', '#e27aa8'].map(mat);
function box(w, h, d, m, x, y, z) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; }
function drapeBox(w, h, d, m, x, y, z) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d, 2, 10, 1), m); o.position.set(x, y, z); o.castShadow = true; return o; }
function flagBox(w, h, d, m, x, y, z) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d, 10, 2, 1), m); o.position.set(x, y, z); o.castShadow = true; return o; }
function cyl(rt, rb, h, seg, m, x, y, z) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; }
function cone(r, h, seg, m, x, y, z) { const o = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m); o.position.set(x, y, z); o.castShadow = true; return o; }
function pyramid(r, h, sz, m, y, x = 0, z = 0) { const g = new THREE.ConeGeometry(r, h, 4); g.rotateY(Math.PI / 4); g.scale(1, 1, sz); const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; return o; }

const rockGeo = new THREE.DodecahedronGeometry(.75, 0), rockMat = mat('#958f84');
// ---------- building models (3 tiers each) ----------
function makeHouse(tier, plinth) {
  const g = new THREE.Group();
  if (plinth) g.add(box(1.8, 1.6, 1.6, M.stone, 0, -.7, 0));
  if (tier === 1) {            // hovel: crooked wattle-and-daub, sagging thatch
    const w = box(1.25, .85, 1.05, M.mud, 0, .5, 0); w.rotation.z = .035; g.add(w);
    for (const sx of [-1, 1]) g.add(box(.09, .9, .09, M.rough, sx * .62, .5, .52));
    g.add(box(1.3, .08, .08, M.rough, 0, .92, .53));
    const r = pyramid(1.12, 1.15, .95, M.thatchOld, 1.47); r.rotation.z = -.05; g.add(r);
    g.add(box(.34, .58, .05, M.timber, -.22, .38, .54));
    g.add(box(.18, .14, .04, M.glow, .3, .62, .54));
    for (let n = 0; n < 4; n++) { const p = box(.05, .35 + hash(n, 3) * .15, .05, M.rough, .9, .2, -.45 + n * .3); p.rotation.x = (hash(n, 9) - .5) * .4; g.add(p); }
  } else if (tier === 2) {     // cottage: timber frame, plaster, neat thatch
    g.add(box(1.5, .3, 1.3, M.stone, 0, .15, 0));
    g.add(box(1.4, 1.0, 1.2, M.plaster, 0, .8, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(.1, 1.02, .1, M.timber, sx * .68, .8, sz * .58));
    g.add(box(1.44, .08, 1.24, M.timber, 0, .9, 0));
    for (const sx of [-1, 1]) { const br = box(.07, .9, .07, M.timber, sx * .45, .8, .61); br.rotation.z = sx * .5; g.add(br); }
    g.add(box(.36, .66, .05, M.timber, 0, .63, .61));
    g.add(box(.04, .26, .32, M.glow, .71, .95, 0));
    g.add(pyramid(1.18, 1.25, .92, M.thatch, 1.92));
    g.add(box(.22, .7, .22, M.stone, .42, 2.05, -.2));
  } else {                     // townhouse: stone ground floor, jettied upper storey, tiled roof
    g.add(box(1.5, .95, 1.3, M.stone2, 0, .48, 0));
    g.add(box(1.66, .85, 1.46, M.plaster, 0, 1.38, 0));
    for (const x of [-.8, -.4, 0, .4, .8]) g.add(box(.07, .85, .04, M.timber, x, 1.38, .74));
    g.add(box(1.7, .08, 1.5, M.timber, 0, .98, 0)); g.add(box(1.7, .08, 1.5, M.timber, 0, 1.8, 0));
    g.add(box(.24, .26, .04, M.glow, -.6, 1.42, .75)); g.add(box(.24, .26, .04, M.glow, .6, 1.42, .75));
    g.add(box(.4, .7, .05, M.timber, -.25, .36, .66)); g.add(box(.26, .22, .05, M.glow, .4, .55, .66));
    g.add(pyramid(1.3, 1.35, .9, M.tile, 2.5));
    g.add(box(.26, 1.0, .26, M.stone2, -.5, 2.6, -.2));
  }
  return g;
}
function makeTower(tier, plinth) {
  const g = new THREE.Group();
  if (plinth) g.add(box(2.0, 1.8, 2.0, M.stone, 0, -.7, 0));
  if (tier === 1) {            // lookout: lashed logs, ladder, thatched hood
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = box(.2, 3.1, .2, M.rough, sx * .62, 1.55, sz * .62); l.rotation.z = -sx * .05; l.rotation.x = sz * .05; g.add(l); }
    const x1 = box(1.6, .09, .09, M.rough, 0, 1.4, .64); x1.rotation.z = .5; g.add(x1);
    const x2 = box(.09, .09, 1.6, M.rough, .64, 1.4, 0); x2.rotation.x = .5; g.add(x2);
    g.add(box(1.7, .18, 1.7, M.rough, 0, 3.1, 0));
    for (let n = 0; n < 8; n++) { const a = n / 8 * Math.PI * 2; const p = box(.07, .5, .07, M.rough, Math.cos(a) * .8, 3.4, Math.sin(a) * .8); p.rotation.z = (hash(n, 4) - .5) * .3; g.add(p); }
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(.08, 1.0, .08, M.rough, sx * .7, 3.65, sz * .7));
    g.add(pyramid(1.35, .9, 1, M.thatchOld, 4.55));
    for (const sx of [-1, 1]) g.add(box(.06, 3.1, .06, M.rough, sx * .22, 1.55, .95));
    for (let y = .35; y < 3; y += .4) g.add(box(.5, .05, .05, M.rough, 0, y, .95));
  } else if (tier === 2) {     // watchtower: squared timber, parapet, roof (scaled to fit one tile)
    const k = new THREE.Group(); k.scale.setScalar(.74); g.add(k);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.add(box(.24, 4.3, .24, M.wood, sx * .7, 2.3, sz * .7));
    for (const y of [1.5, 3.0]) { k.add(box(1.6, .12, .12, M.timber, 0, y, .7)); k.add(box(1.6, .12, .12, M.timber, 0, y, -.7));
      k.add(box(.12, .12, 1.6, M.timber, .7, y, 0)); k.add(box(.12, .12, 1.6, M.timber, -.7, y, 0)); }
    k.add(box(2.2, .25, 2.2, M.timber, 0, 4.5, 0));
    k.add(box(2.2, .6, .12, M.wood, 0, 4.9, 1.05)); k.add(box(2.2, .6, .12, M.wood, 0, 4.9, -1.05));
    k.add(box(.12, .6, 2.2, M.wood, 1.05, 4.9, 0)); k.add(box(.12, .6, 2.2, M.wood, -1.05, 4.9, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.add(box(.1, 1.1, .1, M.timber, sx * .95, 5.3, sz * .95));
    k.add(pyramid(1.75, 1.3, 1, M.roof, 6.45));
    k.add(box(.06, 1.2, .06, M.timber, 0, 7.5, 0)); k.add(flagBox(.6, .36, .04, M.flag, .32, 7.9, 0));
  } else {                     // stone tower: round masonry, timber hoarding, tiled spire
    g.add(cyl(.82, 1.0, 4.6, 8, M.stone2, 0, 2.3, 0));
    g.add(cyl(1.05, 1.05, .2, 8, M.stone, 0, 4.6, 0));
    for (const a of [0, 1.6, 3.2, 4.8]) { const s = box(.08, .4, .14, M.dark, Math.cos(a) * .9, 2.8, Math.sin(a) * .9); s.rotation.y = -a; g.add(s); }
    g.add(box(1.9, .8, 1.9, M.wood, 0, 5.1, 0));
    for (const s of [-.5, 0, .5]) { g.add(box(.14, .3, .04, M.dark, s, 5.1, .96)); g.add(box(.04, .3, .14, M.dark, .96, 5.1, s)); }
    g.add(cone(1.45, 1.7, 8, M.tile, 0, 6.35, 0));
    g.add(box(.06, 1.1, .06, M.timber, 0, 7.6, 0)); g.add(flagBox(.6, .36, .04, M.banner, .32, 7.9, 0));
  }
  return g;
}
function makeCastle(tier, plinth) {
  const g = new THREE.Group(), W = 2.6;
  if (plinth) g.add(box(6.6, 2.0, 6.6, M.stone, 0, -.8, 0));
  g.add(box(4.8, .12, 4.8, M.court, 0, .26, 0));
  if (tier === 1) {            // palisade fort: sharpened logs and a timber hall
    for (let s = -W; s <= W + .01; s += .45) {
      const hh = k => 2.0 + hash(s * 3, k) * .4;
      g.add(cyl(.14, .16, hh(1), 5, M.rough, s, 1.1, -W)); g.add(cyl(.14, .16, hh(2), 5, M.rough, W, 1.1, s)); g.add(cyl(.14, .16, hh(3), 5, M.rough, -W, 1.1, s));
      if (Math.abs(s) > .7) g.add(cyl(.14, .16, hh(4), 5, M.rough, s, 1.1, W));
    }
    g.add(box(2.4, 2.4, 2.0, M.wood, 0, 1.5, -.6));
    g.add(pyramid(1.78, 1.4, .82, M.thatchOld, 3.4, 0, -.6));
    g.add(box(.5, .8, .06, M.timber, 0, .7, .42));
    for (const [px, pz] of [[1.9, 1.9], [-1.9, 1.9], [1.9, -1.9], [-1.9, -1.9]]) {   // a small lookout platform in each corner of the stockade
      g.add(box(.8, .1, .8, M.rough, px, 2.5, pz));
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(.09, 2.5, .09, M.rough, px + sx * .33, 1.25, pz + sz * .33));
      for (const sx of [-1, 1]) g.add(box(.05, .3, .8, M.rough, px + sx * .38, 2.7, pz));
    }
    g.add(box(.06, 1.4, .06, M.timber, 0, 4.4, -.6)); g.add(flagBox(.7, .4, .04, M.flag, .38, 4.8, -.6));
  } else if (tier === 2) {     // timber and stone: plank curtain wall, wooden corner towers, stone gatehouse and keep
    g.add(box(5.2, 2.0, .3, M.wood, 0, 1.2, -W)); g.add(box(.3, 2.0, 5.2, M.wood, W, 1.2, 0)); g.add(box(.3, 2.0, 5.2, M.wood, -W, 1.2, 0));
    g.add(box(1.6, 2.0, .3, M.wood, -1.8, 1.2, W)); g.add(box(1.6, 2.0, .3, M.wood, 1.8, 1.2, W));
    for (let s = -2.1; s <= 2.11; s += .6) {               // posts between the planks
      g.add(box(.1, 2.1, .36, M.timber, s, 1.25, -W)); g.add(box(.36, 2.1, .1, M.timber, W, 1.25, s)); g.add(box(.36, 2.1, .1, M.timber, -W, 1.25, s));
      if (Math.abs(s) > 1) g.add(box(.1, 2.1, .36, M.timber, s, 1.25, W));
    }
    g.add(box(5.3, .12, .42, M.timber, 0, 2.25, -W)); g.add(box(.42, .12, 5.3, M.timber, W, 2.25, 0)); g.add(box(.42, .12, 5.3, M.timber, -W, 2.25, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {     // wooden towers with an open fighting platform and a thatched hood
      const x = sx * W, z = sz * W;
      g.add(box(1.0, 3.2, 1.0, M.wood, x, 1.8, z)); g.add(box(1.3, .14, 1.3, M.timber, x, 3.48, z));
      for (const px of [-1, 1]) for (const pz of [-1, 1]) g.add(box(.08, 1.15, .08, M.timber, x + px * .56, 4.1, z + pz * .56));
      g.add(pyramid(1.0, .8, 1, M.thatch, 5.05, x, z));
    }
    for (const sx of [-1, 1]) g.add(box(.62, 2.9, .9, M.stone, sx * .75, 1.65, W));
    g.add(box(2.1, .6, .9, M.stone, 0, 3.0, W));
    for (const s of [-.75, 0, .75]) g.add(box(.3, .3, .9, M.stone, s, 3.45, W));
    g.add(box(.85, 1.7, .08, M.timber, 0, 1.15, W + .42));
    g.add(box(2.4, 4.0, 2.4, M.stone2, 0, 2.2, -.4));
    for (const s of [-.9, 0, .9]) { g.add(box(.4, .4, .4, M.stone2, s, 4.4, -1.4)); g.add(box(.4, .4, .4, M.stone2, s, 4.4, .6)); }
    g.add(box(.4, .5, .06, M.glow, 0, 3.0, .82));
    g.add(box(.07, 1.6, .07, M.timber, 0, 5.0, -.4)); g.add(flagBox(.8, .45, .04, M.flag, .43, 5.5, -.4));
  } else {                     // castle: round towers, gatehouse, tall keep, banners
    g.add(box(5.2, 2.2, .5, M.stone2, 0, 1.3, -W)); g.add(box(.5, 2.2, 5.2, M.stone2, W, 1.3, 0)); g.add(box(.5, 2.2, 5.2, M.stone2, -W, 1.3, 0));
    g.add(box(1.6, 2.2, .5, M.stone2, -1.8, 1.3, W)); g.add(box(1.6, 2.2, .5, M.stone2, 1.8, 1.3, W));
    for (let s = -2.0; s <= 2.01; s += .8) {
      g.add(box(.35, .4, .55, M.stone2, s, 2.6, -W)); g.add(box(.55, .4, .35, M.stone2, W, 2.6, s)); g.add(box(.55, .4, .35, M.stone2, -W, 2.6, s));
      if (Math.abs(s) > 1) g.add(box(.35, .4, .55, M.stone2, s, 2.6, W));
    }
    g.add(box(.7, 3.0, .9, M.stone2, -.75, 1.7, W)); g.add(box(.7, 3.0, .9, M.stone2, .75, 1.7, W));
    g.add(box(2.2, .7, .9, M.stone2, 0, 3.0, W)); g.add(box(.85, 1.7, .08, M.timber, 0, 1.15, W + .42));
    g.add(drapeBox(.5, .9, .04, M.drape, -.75, 2.2, W + .47)); g.add(drapeBox(.5, .9, .04, M.drape, .75, 2.2, W + .47));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      g.add(cyl(.75, .85, 3.6, 8, M.stone2, sx * W, 2.0, sz * W)); g.add(cyl(.95, .95, .25, 8, M.stone, sx * W, 3.9, sz * W));
      g.add(cone(1.0, 1.4, 8, M.tile, sx * W, 4.7, sz * W));
    }
    g.add(box(2.4, 4.6, 2.4, M.stone2, 0, 2.5, -.4));
    for (const s of [-.9, 0, .9]) {
      g.add(box(.4, .45, .4, M.stone2, s, 5.0, -1.4)); g.add(box(.4, .45, .4, M.stone2, s, 5.0, .6));
      g.add(box(.4, .45, .4, M.stone2, -1.0, 5.0, s - .4)); g.add(box(.4, .45, .4, M.stone2, 1.0, 5.0, s - .4));
    }
    g.add(box(.5, .7, .06, M.glow, 0, 3.4, .82)); g.add(box(.5, .7, .06, M.glow, 0, 2.0, .82));
    g.add(box(.07, 1.8, .07, M.timber, 0, 5.9, -.4)); g.add(flagBox(.9, .5, .04, M.flag, .48, 6.5, -.4));
  }
  return g;
}
function makeLodge(tier, plinth) {
  const g = new THREE.Group();
  if (plinth) g.add(box(3.7, 1.8, 3.0, M.stone, 0, -.7, 0));
  const pile = (x, z, n) => { for (let r = 0; r < n; r++) for (let c = 0; c < n - r; c++) { const l = cyl(.17, .17, 1.1, 7, M.log, x + (c - (n - r - 1) / 2) * .36, .3 + r * .3, z); l.rotation.x = Math.PI / 2; g.add(l); } };
  const axeStump = (x, z) => { g.add(cyl(.28, .3, .45, 8, M.logEnd, x, .25, z)); const h = box(.05, .6, .05, M.timber, x + .08, .7, z); h.rotation.z = -.4; g.add(h); g.add(box(.05, .16, .22, M.iron, x - .02, .5, z)); };
  if (tier === 1) {            // woodcutter's hut: short log walls, thatched roof, chopping stump
    for (let n = 0; n < 3; n++) {
      const y = .3 + n * .3;
      const l1 = cyl(.15, .15, 2.0, 6, M.log, -.3, y, .45); l1.rotation.z = Math.PI / 2; g.add(l1);
      const l2 = cyl(.15, .15, 2.0, 6, M.log, -.3, y, -.75); l2.rotation.z = Math.PI / 2; g.add(l2);
      const l3 = cyl(.15, .15, 1.4, 6, M.log, .6, y + .15, -.15); l3.rotation.x = Math.PI / 2; g.add(l3);
      const l4 = cyl(.15, .15, 1.4, 6, M.log, -1.2, y + .15, -.15); l4.rotation.x = Math.PI / 2; g.add(l4);
    }
    g.add(box(1.7, .9, 1.1, M.rough, -.3, .6, -.15));
    g.add(pyramid(1.5, 1.1, .78, M.thatchOld, 1.6, -.3, -.15));
    g.add(box(.4, .65, .06, M.timber, -.6, .45, .52));
    pile(.9, 1.2, 2);
    axeStump(-1.0, 1.2);
  } else {                     // log cabin, then timber yard
    for (let n = 0; n < 5; n++) {
      const y = .35 + n * .32;
      const l1 = cyl(.17, .17, 2.9, 6, M.log, 0, y, .9); l1.rotation.z = Math.PI / 2; g.add(l1);
      const l2 = cyl(.17, .17, 2.9, 6, M.log, 0, y, -.9); l2.rotation.z = Math.PI / 2; g.add(l2);
      const l3 = cyl(.17, .17, 2.0, 6, M.log, 1.3, y + .16, 0); l3.rotation.x = Math.PI / 2; g.add(l3);
      const l4 = cyl(.17, .17, 2.0, 6, M.log, -1.3, y + .16, 0); l4.rotation.x = Math.PI / 2; g.add(l4);
    }
    g.add(box(2.5, 1.5, 1.7, M.wood, 0, .95, 0));
    g.add(pyramid(2.2, 1.4, .82, tier === 3 ? M.tile : M.thatch, 2.55));
    g.add(box(.55, 1.0, .06, M.timber, -.6, .7, 1.08));
    g.add(box(.3, .24, .06, M.glow, .6, 1.2, 1.08));
    pile(.7, 1.55, 3);
    axeStump(-1.2, 1.5);
    if (tier === 3) {
      g.add(box(.45, 2.6, .45, M.stone, 1.05, 1.7, -.45));
      pile(-1.6, -.2, 3);
      for (const z of [-.3, .3]) { const s = box(.1, .7, .1, M.timber, .2, .35, 1.5 + z); s.rotation.z = .35; g.add(s); const s2 = box(.1, .7, .1, M.timber, -.2, .35, 1.5 + z); s2.rotation.z = -.35; g.add(s2); }
    }
  }
  return g;
}
function makeQuarry(tier, plinth) {
  const g = new THREE.Group();
  if (plinth) g.add(box(3.7, 1.8, 3.4, M.stone, 0, -.7, 0));
  const blocks = list => list.forEach(([x, y, z]) => g.add(box(.5, .45, .5, M.stone2, x, y, z)));
  if (tier === 1) {            // stone pit: masons' shed, cut blocks, timber hoist
    g.add(box(1.3, .9, 1.1, M.rough, -.85, .55, -.85));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(box(.1, .95, .1, M.timber, -.85 + sx * .62, .55, -.85 + sz * .52));
    g.add(pyramid(1.1, .95, .9, M.thatchOld, 1.45, -.85, -.85));
    g.add(box(.36, .6, .05, M.timber, -.85, .4, -.28));
    blocks([[.55, .32, .55], [1.1, .32, .55], [.82, .76, .55]]);
    for (let n = 0; n < 5; n++) { const r = new THREE.Mesh(rockGeo, rockMat); r.scale.setScalar(.25 + hash(n, 2) * .15); r.position.set(.4 + hash(n, 5) * 1.1, .15, 1.1 + hash(n, 8) * .4); r.castShadow = true; g.add(r); }
    // A-frame hoist with a block on the rope
    for (const sx of [-1, 1]) { const l = box(.09, 2.0, .09, M.rough, .9 + sx * .3, 1.0, -.9); l.rotation.z = -sx * .17; g.add(l); }
    g.add(box(.8, .08, .08, M.rough, .9, 1.95, -.9));
    g.add(box(.03, .7, .03, M.dark, .9, 1.55, -.9)); g.add(box(.36, .3, .36, M.stone2, .9, 1.1, -.9));
    // low dry-stone wall
    for (let s = -1.6; s <= 1.61; s += .45) g.add(box(.42, .3, .3, M.stone, s, .15, -1.65));
  } else {
    g.add(box(1.8, 1.4, 1.5, M.stone2, -.75, .9, -.8));
    g.add(pyramid(1.45, .9, .9, M.roof, 2.05, -.75, -.8));
    g.add(box(.5, .9, .06, M.timber, -.75, .65, -.03)); g.add(box(.28, .24, .06, M.glow, -.2, 1.1, -.03));
    blocks([[.6, .35, .6], [1.15, .35, .6], [.6, .35, 1.15], [1.15, .35, 1.15], [.88, .8, .88]]);
    if (tier === 3) {
      g.add(box(.14, 2.6, .14, M.timber, 1.0, 1.4, -1.0)); g.add(box(1.8, .12, .12, M.timber, .4, 2.6, -1.0));
      g.add(box(.03, .9, .03, M.dark, -.4, 2.15, -1.0)); g.add(box(.35, .3, .35, M.stone2, -.4, 1.55, -1.0));
      g.add(box(1.0, .35, .6, M.wood, -1.0, .55, 1.0));
      for (const x of [-1.4, -.6]) { const w = cyl(.22, .22, .08, 10, M.timber, x, .25, 1.33); w.rotation.x = Math.PI / 2; g.add(w); }
      blocks([[-1.15, .95, 1.0], [-.75, .95, 1.0]]);
    }
  }
  return g;
}
function makeFarm(tier) {
  const g = new THREE.Group();
  g.add(box(3.5, .08, 3.5, M.soil, 0, .06, 0));
  const rows = tier === 1 ? 4 : 7, per = tier === 1 ? 4 : 9;
  for (let r = 0; r < rows; r++) {
    const z = (tier === 1 ? -.4 : -1.45) + r * ((tier === 1 ? 1.85 : 2.9) / (rows - 1));
    if (tier === 3) {        // tall golden wheat: thin stalks with slightly bent heads
      for (let c = 0; c < 12; c++) {
        const x = -1.45 + c * .27 + (hash(r, c) - .5) * .08, h = .5 + hash(c, r * 3) * .14;
        const st = cone(.075, h, 4, M.wheat, x, h / 2 + .08, z + (hash(c + 7, r) - .5) * .06);
        st.rotation.z = (hash(c, r + 9) - .5) * .25; st.rotation.x = (hash(r + 3, c) - .5) * .2; g.add(st);
      }
      continue;
    }
    for (let c = 0; c < per; c++) {
      if (tier === 1 && hash(r, c) < .25) continue;
      const x = (tier === 1 ? -1.5 : -1.5) + c * ((tier === 1 ? 3.0 : 3.0) / (per - 1)), h = tier === 1 ? .28 + hash(c, r) * .15 : .4;
      g.add(cone(.13, h, 4, tier === 1 ? M.crop1 : M.crop2, x, h / 2 + .08, z));
    }
  }
  for (let s = -1.75; s <= 1.76; s += .5) for (const [x, z] of [[s, -1.75], [s, 1.75], [-1.75, s], [1.75, s]]) {
    if (tier === 1 && hash(x * 3, z * 5) < .45) continue;
    const p = box(.07, .5, .07, tier === 1 ? M.rough : M.timber, x, .25, z); if (tier === 1) p.rotation.z = (hash(x, z) - .5) * .4; g.add(p);
  }
  if (tier > 1) for (const [x, z, w, d] of [[0, -1.75, 3.5, .05], [0, 1.75, 3.5, .05], [-1.75, 0, .05, 3.5], [1.75, 0, .05, 3.5]]) g.add(box(w, .05, d, M.timber, x, .38, z));
  if (tier === 1) { // thatched field hut
    g.add(box(1.1, .75, .8, M.mud, -1.0, .45, -1.2)); g.add(pyramid(.95, .85, .8, M.thatchOld, 1.25, -1.0, -1.2)); g.add(box(.3, .5, .05, M.timber, -1.0, .33, -.79));
    g.add(cyl(.28, .3, .4, 8, M.hay, .9, .25, -1.2));
  }
  if (tier >= 2) { // scarecrow
    g.add(box(.06, 1.2, .06, M.timber, 1.1, .6, -.9)); g.add(box(.7, .05, .05, M.timber, 1.1, .95, -.9));
    g.add(box(.25, .35, .18, M.canvas, 1.1, .85, -.9));
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.12, 6, 5), M.hay); hd.position.set(1.1, 1.25, -.9); g.add(hd);
  }
  if (tier === 3) { // barn + hay
    g.add(box(1.1, .9, .9, M.wood, -1.15, .5, -1.15)); g.add(pyramid(.85, .7, .85, M.tile, 1.3, -1.15, -1.15));
    for (const [sx, sz] of [[1.35, 1.35], [.75, 1.42]]) {     // stooks: sheaves leaned together
      for (let n = 0; n < 4; n++) { const a = n / 4 * Math.PI * 2, sh = cyl(.06, .09, .55, 6, M.hay, sx + Math.cos(a) * .08, .32, sz + Math.sin(a) * .08); sh.rotation.z = Math.cos(a) * .25; sh.rotation.x = -Math.sin(a) * .25; g.add(sh); }
    }
  }
  return g;
}
// walls pick their arms from the neighbour bitmask, like roads
function makeWall(tier, plinth, mask = 0) {
  const g = new THREE.Group();
  const arms = DIRS.filter(d => mask & d[2]);
  if (tier === 1) {
    g.add(cyl(.17, .19, 2.0, 6, M.rough, 0, 1.0, 0));
    for (const [dx, dz] of arms) {
      for (const t of [.36, .7, 1.0]) g.add(cyl(.15, .17, 1.7 + hash(t * 7, dx + dz * 3) * .4, 6, M.rough, dx * t, .9, dz * t));
      g.add(box(dx ? 1 : .06, .07, dz ? 1 : .06, M.timber, dx * .5, 1.2, dz * .5));
    }
    if (!arms.length) for (const a of [0, 2.1, 4.2]) g.add(cyl(.13, .15, 1.6, 6, M.rough, Math.cos(a) * .35, .8, Math.sin(a) * .35));
  } else {
    const m = tier === 2 ? M.stone : M.stone2, ht = tier === 2 ? 1.7 : 2.2;
    g.add(box(.62, ht + .2, .62, m, 0, (ht + .2) / 2, 0));
    for (const [dx, dz] of arms) {
      g.add(box(dx ? 1.0 : .42, ht, dz ? 1.0 : .42, m, dx * .5, ht / 2, dz * .5));
      if (tier === 3) for (const t of [.42, .85]) g.add(box(.26, .3, .26, m, dx * t, ht + .15, dz * t));
    }
    if (tier === 3) g.add(box(.74, .22, .74, M.stone, 0, ht + .31, 0));
  }
  return g;
}
function makeGate(tier, plinth, mask = 0) {
  const outer = new THREE.Group(), g = new THREE.Group(); outer.add(g);
  if (plinth) outer.add(box(1.6, 1.4, 1.6, M.stone, 0, -.6, 0));
  if ((mask & 5) && !(mask & 10)) g.rotation.y = Math.PI / 2;   // walls run N–S, so turn the opening
  if (tier === 1) {
    for (const sx of [-1, 1]) { g.add(cyl(.2, .22, 2.5, 6, M.rough, sx * .8, 1.25, 0)); const leaf = box(.07, 1.6, .62, M.wood, sx * .66, .85, .36); g.add(leaf); }
    const lt = cyl(.12, .12, 2.0, 6, M.rough, 0, 2.35, 0); lt.rotation.z = Math.PI / 2; g.add(lt);
  } else if (tier === 2) {
    for (const sx of [-1, 1]) { g.add(box(.45, 2.5, .7, M.stone, sx * .78, 1.25, 0)); g.add(box(.06, 1.5, .55, M.wood, sx * .5, .78, .45)); }
    g.add(box(2.0, .55, .7, M.stone, 0, 2.6, 0));
    for (const s of [-.7, 0, .7]) g.add(box(.3, .3, .7, M.stone, s, 3.0, 0));
    g.add(box(1.1, .35, .06, M.iron, 0, 2.1, 0));
  } else {
    for (const sx of [-1, 1]) { g.add(cyl(.42, .48, 3.2, 8, M.stone2, sx * .8, 1.6, 0)); g.add(cone(.58, .9, 8, M.tile, sx * .8, 3.65, 0)); }
    g.add(box(1.2, .7, .65, M.stone2, 0, 2.55, 0));
    g.add(drapeBox(.4, .7, .04, M.drape, 0, 1.95, .34)); g.add(box(1.0, .3, .06, M.iron, 0, 2.05, 0));
  }
  return outer;
}
function makeWell() {
  const g = new THREE.Group();
  g.add(cyl(.5, .55, .6, 10, M.stone2, 0, .3, 0)); g.add(cyl(.4, .4, .05, 10, M.water, 0, .58, 0));
  for (const sx of [-1, 1]) g.add(box(.08, 1.2, .08, M.timber, sx * .48, .9, 0));
  const bar = cyl(.04, .04, 1.0, 6, M.timber, 0, 1.2, 0); bar.rotation.z = Math.PI / 2; g.add(bar);
  g.add(pyramid(.78, .55, .75, M.tile, 1.75)); g.add(cyl(.09, .08, .14, 8, M.wood, 0, .95, 0));
  return g;
}
function makeTorch() {   // one third of a tile: a small flagstone base with an iron brazier on a post
  const g = new THREE.Group();
  g.add(box(.66, .07, .66, M.stone, 0, .04, 0));
  g.add(box(.3, .22, .3, M.stone2, 0, .18, 0)); g.add(box(.1, 1.7, .1, M.timber, 0, 1.05, 0));
  g.add(cyl(.13, .07, .18, 6, M.iron, 0, 1.95, 0)); g.add(cone(.11, .32, 6, M.flame, 0, 2.2, 0));
  return g;
}
function makeFlowers() {
  const g = new THREE.Group();
  g.add(box(1.5, .14, 1.5, M.soil, 0, .08, 0));
  for (let s = -.72; s <= .73; s += .36) for (const [x, z] of [[s, -.78], [s, .78], [-.78, s], [.78, s]]) g.add(box(.32, .12, .1, M.stone, x, .1, z).rotateY(Math.abs(x) > .7 ? Math.PI / 2 : 0));
  for (let n = 0; n < 18; n++) {
    const x = (hash(n, 1) - .5) * 1.2, z = (hash(n, 2) - .5) * 1.2;
    g.add(cone(.07, .25, 4, M.leaf, x, .27, z));
    const f = new THREE.Mesh(new THREE.SphereGeometry(.08, 6, 4), FLOWER[n % FLOWER.length]); f.position.set(x, .42, z); g.add(f);
  }
  return g;
}
function makeStatue() {
  const g = new THREE.Group();
  g.add(box(1.0, .25, 1.0, M.stone, 0, .12, 0)); g.add(box(.75, .7, .75, M.stone2, 0, .6, 0));
  g.add(cyl(.18, .26, .9, 8, M.stone2, 0, 1.4, 0));
  const hd = new THREE.Mesh(new THREE.SphereGeometry(.15, 8, 6), M.stone2); hd.position.set(0, 2.0, 0); g.add(hd);
  const arm = box(.1, .55, .1, M.stone2, .22, 1.95, 0); arm.rotation.z = -.4; g.add(arm);
  g.add(box(.05, .8, .05, M.stone2, .38, 2.5, 0));
  return g;
}
const MODELS = { house: makeHouse, tower: makeTower, castle: makeCastle, lodge: makeLodge, quarry: makeQuarry, farm: makeFarm,
  wall: makeWall, gate: makeGate, well: makeWell, torch: makeTorch, flowers: makeFlowers, statue: makeStatue };
// grit: every mesh gets a slightly different, weathered copy of its material; tier 1 is dirtier and duller
const aoTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 20, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(.55, 'rgba(0,0,0,.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const aoMat = new THREE.MeshBasicMaterial({ color: '#000000', map: aoTex, transparent: true, opacity: .42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
const NO_AO = { farm: 1, flowers: 1, torch: 1 };
const tintCache = new Map(), NO_TINT = new Set([M.glow, M.flame, M.water, aoMat, M.flag, M.banner, M.drape]);
function tinted(m, tier, n) {
  const key = m.uuid + ':' + tier + ':' + n; let t = tintCache.get(key);
  if (!t) {
    t = m.clone(); if (m.onBeforeCompile && m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile) t.onBeforeCompile = m.onBeforeCompile;
    const grime = tier === 1 ? .8 : tier === 2 ? .9 : .97, hsl = {};
    t.color.multiplyScalar(grime * (.88 + .2 * hash(n + 1, tier * 3.3))); t.color.convertLinearToSRGB(); t.color.getHSL(hsl);
    t.color.setHSL(hsl.h + (hash(n, 7) - .5) * .02, hsl.s * (tier === 1 ? .72 : .86), hsl.l);
    tintCache.set(key, t);
  }
  return t;
}
const makeModel = (type, tier, plinth, mask) => {
  const g = MODELS[type](tier, plinth && type !== 'farm' && !DEF[type].decor, mask), tt = DEF[type].decor ? 2 : tier;
  if (!NO_AO[type]) { const w = DEF[type].size * CELL + 1.3, ao = new THREE.Mesh(new THREE.PlaneGeometry(w, w).rotateX(-Math.PI / 2), aoMat); ao.position.y = .04; ao.userData.ao = true; g.add(ao); }
  let n = 0;
  g.traverse(o => { if (o.userData.ao) return; if (o.isMesh) { o.castShadow = o.receiveShadow = true; if (!NO_TINT.has(o.material)) o.material = tinted(o.material, tt, (n++ * 5 + Math.floor(Math.random() * 3)) % 6); } });
  return g;
};

const scene = new THREE.Group();
const tunics = ['#7a3b2e', '#3f5a7a', '#6b6a3a', '#8a6a3a', '#5a3d5e', '#3d6b55'].map(mat);
const skin = mat('#d6a982'), hatM = mat('#4a3a26'), legM = mat('#3a2e22');
function makeTool(kind) {
  const p = new THREE.Group(); p.position.set(0, -.33, 0);
  if (kind === 'bow') {                 // long axis along the hand's z, which points up when the arm is raised forward
    p.add(box(.035, .035, .7, M.timber, 0, 0, 0));
    for (const s of [-1, 1]) { const tip = box(.03, .03, .16, M.timber, 0, .04, s * .38); tip.rotation.x = s * .5; p.add(tip); }
    p.add(box(.01, .01, .74, M.canvas, 0, .1, 0));
    return p;
  }
  if (kind === 'sword') { p.add(box(.035, .12, .035, M.timber, 0, .03, 0)); p.add(box(.05, .035, .16, M.iron, 0, -.04, 0)); p.add(box(.025, .56, .05, M.iron, 0, -.34, 0)); p.rotation.x = -.4; return p; }
  p.add(box(.035, .64, .035, M.timber, 0, -.22, 0));
  if (kind === 'axe') p.add(box(.03, .16, .2, M.iron, 0, -.48, .1));
  if (kind === 'pick') { p.add(box(.035, .05, .46, M.iron, 0, -.52, 0)); }
  if (kind === 'hoe') p.add(box(.15, .02, .13, M.iron, 0, -.53, .07));
  if (kind === 'hammer') p.add(box(.07, .09, .18, M.iron, 0, -.5, 0));
  return p;
}
function makePerson(opts) {
  const g = new THREE.Group(), body = new THREE.Group();
  const legs = [-.09, .09].map(x => { const l = box(.1, .4, .12, legM, x, 0, 0); l.geometry.translate(0, -.2, 0); l.position.y = .4; body.add(l); return l; });
  const tun = opts.tunic || tunics[Math.floor(Math.random() * tunics.length)];
  const torso = cyl(.14, .2, .5, 6, tun, 0, .65, 0); body.add(torso);
  const arms = [-1, 1].map(sx => {                     // shoulder pivot, sleeve, and a hand
    const a = new THREE.Group(); a.position.set(sx * .19, .86, 0);
    const sl = box(.075, .3, .075, tun, 0, -.15, 0); sl.rotation.z = sx * .08; a.add(sl); a.userData.sleeve = sl;
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.048, 6, 5), skin); hd.position.set(sx * .012, -.33, 0); hd.castShadow = true; a.add(hd);
    body.add(a); return a;
  });
  const head = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), skin); head.position.y = 1.03; head.castShadow = true; body.add(head);
  let hatG = null; if (opts.hat) { hatG = cone(.17, .22, 6, opts.hat, 0, 1.2, 0); body.add(hatG); }
  let pivot = null;
  if (opts.tool) { pivot = makeTool(opts.tool); (opts.tool === 'bow' ? arms[0] : arms[1]).add(pivot); }
  body.scale.setScalar(opts.scale || 1);
  g.add(body); scene.add(g);
  return { g, body, legs, arms, torso, hatG, baseTunic: tun, pivot, x: 0, z: 0, tx: 0, tz: 0, wait: Math.random() * 2, speed: .9 + Math.random() * .6, phase: Math.random() * 6, stuck: 0 };
}
// work clothes: each job has its own tunic, hat and (for masons and builders) a leather apron
const OUTFIT = {
  hoe:    { tunic: mat('#8c7a48'), hat: 'straw' },
  axe:    { tunic: mat('#6a3527'), hat: 'hood', hatM: (() => { const m = mat('#4a5a32'); m.side = THREE.DoubleSide; return m; })() },
  pick:   { tunic: mat('#6e6a62'), hat: 'cap', hatM: mat('#d8d0bc'), apron: true },
  hammer: { tunic: mat('#7d6a4c'), hat: 'felt', hatM: mat('#5a3d27'), apron: true },
};
const strawM = mat('#d2b56a'), leatherM = mat('#5a4630');
function dress(v, kind) {
  const O = OUTFIT[kind], tun = O ? O.tunic : v.baseTunic;
  v.torso.material = tun; v.arms.forEach(a => a.userData.sleeve.material = tun);
  if (v.hatG) v.body.remove(v.hatG); v.hatG = null;
  if (v.apron) { v.body.remove(v.apron); v.apron = null; }
  const h = new THREE.Group();
  if (!O) { if (v.plainHat) h.add(cone(.17, .22, 6, hatM, 0, 1.2, 0)); }
  else if (O.hat === 'straw') { h.add(cyl(.28, .28, .025, 12, strawM, 0, 1.13, 0)); h.add(cyl(.12, .14, .13, 10, strawM, 0, 1.2, 0)); }
  else if (O.hat === 'hood') {              // wool hood open at the face, with a short cape over the shoulders
    const hd = new THREE.Mesh(new THREE.SphereGeometry(.158, 12, 8, Math.PI * .75, Math.PI * 1.5, 0, Math.PI * .66), O.hatM); hd.position.set(0, 1.04, -.01); hd.castShadow = true; h.add(hd);
    h.add(cyl(.17, .26, .15, 10, O.hatM, 0, .9, -.01));
    const tail = cone(.05, .2, 5, O.hatM, 0, 1.12, -.17); tail.rotation.x = -1.9; h.add(tail);
  }
  else if (O.hat === 'cap') {               // close linen coif tied under the chin
    const cf = new THREE.Mesh(new THREE.SphereGeometry(.143, 12, 6, 0, Math.PI * 2, 0, Math.PI * .5), O.hatM); cf.position.y = 1.035; cf.castShadow = true; h.add(cf);
    for (const sx of [-1, 1]) h.add(box(.02, .13, .02, O.hatM, sx * .12, .96, .02));
  }
  else if (O.hat === 'felt') { h.add(cyl(.2, .2, .03, 10, O.hatM, 0, 1.12, 0)); h.add(cyl(.12, .13, .11, 10, O.hatM, 0, 1.19, 0)); }
  v.body.add(h); v.hatG = h;
  if (O && O.apron) { v.apron = box(.27, .36, .03, leatherM, 0, .6, .19); v.body.add(v.apron); }
}
function giveTool(v, kind) {
  if (v.torso) dress(v, kind);
  if (v.pivot) v.pivot.parent.remove(v.pivot); v.pivot = null; v.toolKind = kind || null;
  if (!kind) return;
  const p = makeTool(kind); v.arms[1].add(p); v.pivot = p;
}
const JOB_TOOL = { lodge: 'axe', quarry: 'pick', farm: 'hoe' };
const toolFor = v => v.build ? 'hammer' : v.job ? JOB_TOOL[v.job.type] : null;
const castleB = () => buildings.find(B => B.type === 'castle');
function makeVillager(home) {
  const v = makePerson({}); v.plainHat = Math.random() < .5; dress(v, null);
  v.carryLog = cyl(.085, .085, .9, 6, M.log, .19, 1.03, .02); v.carryLog.rotation.x = Math.PI / 2; v.carryLog.visible = false; v.body.add(v.carryLog);
  v.carryStone = box(.32, .26, .3, M.stone2, 0, .72, .26); v.carryStone.visible = false; v.body.add(v.carryStone);
  const dp = doorPoint(home);
  Object.assign(v, { home, job: null, build: null, state: 'find', x: dp.x + (Math.random() - .5) * .6, z: dp.z + (Math.random() - .5) * .6 });
  v.tx = v.x; v.tz = v.z; v.wait = Math.random() * .4; v.fresh = true;
  if (PH.kind === 'night') { v.inside = true; v.indoor = castleB(); v.g.visible = false; }
  villagers.push(v); return v;
}
// houses (and the castle) are where villagers come from; each tier houses more people
