// tiny stand-in for the parts of three.js the building models use, drawn with a painter's-algorithm canvas renderer
(function () {
  let uid = 0;
  class V3 { constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; } set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
    setScalar(s) { return this.set(s, s, s); } copy(v) { return this.set(v.x, v.y, v.z); } clone() { return new V3(this.x, this.y, this.z); } }
  class Color {
    constructor(a, b, c) { this.r = 1; this.g = 1; this.b = 1; if (c !== undefined) { this.r = a; this.g = b; this.b = c; } else if (a !== undefined) this.set(a); }
    set(v) { if (v instanceof Color) return this.copy(v); if (typeof v === 'number') { this.r = (v >> 16 & 255) / 255; this.g = (v >> 8 & 255) / 255; this.b = (v & 255) / 255; return this; }
      const h = v.replace('#', ''); const f = h.length === 3 ? h.split('').map(c => c + c).join('') : h; return this.set(parseInt(f, 16)); }
    setRGB(r, g, b) { this.r = r; this.g = g; this.b = b; return this; }
    copy(c) { this.r = c.r; this.g = c.g; this.b = c.b; return this; } clone() { return new Color(this.r, this.g, this.b); }
    multiplyScalar(s) { this.r *= s; this.g *= s; this.b *= s; return this; } multiply(c) { this.r *= c.r; this.g *= c.g; this.b *= c.b; return this; }
    lerp(c, t) { this.r += (c.r - this.r) * t; this.g += (c.g - this.g) * t; this.b += (c.b - this.b) * t; return this; }
    convertSRGBToLinear() { return this; } convertLinearToSRGB() { return this; }
    getHSL(t) { const r = this.r, g = this.g, b = this.b, mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
      if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; }
      t.h = h; t.s = s; t.l = l; return t; }
    setHSL(h, s, l) { h = ((h % 1) + 1) % 1; const f = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < .5 ? q : t < 2 / 3 ? p + (q - p) * 6 * (2 / 3 - t) : p; };
      if (!s) return this.setRGB(l, l, l); const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return this.setRGB(f(p, q, h + 1 / 3), f(p, q, h), f(p, q, h - 1 / 3)); }
  }
  class Geo {
    constructor(v, f) { this.v = v; this.f = f; }
    map(fn) { this.v = this.v.map(fn); return this; }
    translate(x, y, z) { return this.map(([a, b, c]) => [a + x, b + y, c + z]); }
    scale(x, y, z) { return this.map(([a, b, c]) => [a * x, b * y, c * z]); }
    rotateX(t) { const c = Math.cos(t), s = Math.sin(t); return this.map(([x, y, z]) => [x, y * c - z * s, y * s + z * c]); }
    rotateY(t) { const c = Math.cos(t), s = Math.sin(t); return this.map(([x, y, z]) => [x * c + z * s, y, -x * s + z * c]); }
    rotateZ(t) { const c = Math.cos(t), s = Math.sin(t); return this.map(([x, y, z]) => [x * c - y * s, x * s + y * c, z]); }
    computeVertexNormals() { return this; }
  }
  function lathe(rt, rb, h, seg, open) {
    const v = [], f = [];
    for (let i = 0; i < seg; i++) { const a = i / seg * Math.PI * 2; v.push([Math.sin(a) * rt, h / 2, Math.cos(a) * rt], [Math.sin(a) * rb, -h / 2, Math.cos(a) * rb]); }
    for (let i = 0; i < seg; i++) { const j = (i + 1) % seg, a = i * 2, b = i * 2 + 1, c = j * 2, d = j * 2 + 1; f.push([a, b, d], [a, d, c]); }
    const top = v.length; v.push([0, h / 2, 0]); const bot = v.length; v.push([0, -h / 2, 0]);
    for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; if (rt > 0) f.push([top, i * 2, j * 2]); f.push([bot, j * 2 + 1, i * 2 + 1]); }
    return new Geo(v, f);
  }
  const T = {};
  T.Color = Color; T.Material = class{}; T.Material.prototype.onBeforeCompile = function(){}; T.Vector3 = V3; T.BackSide = 1; T.DoubleSide = 2;
  T.BoxGeometry = class extends Geo { constructor(w, h, d) { const x = w / 2, y = h / 2, z = d / 2;
    super([[-x, -y, -z], [x, -y, -z], [x, y, -z], [-x, y, -z], [-x, -y, z], [x, -y, z], [x, y, z], [-x, y, z]],
      [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 4, 7], [0, 7, 3], [1, 2, 6], [1, 6, 5], [3, 7, 6], [3, 6, 2], [0, 1, 5], [0, 5, 4]]); } };
  T.CylinderGeometry = class extends Geo { constructor(rt, rb, h, seg = 8) { const g = lathe(rt, rb, h, seg); super(g.v, g.f); } };
  T.ConeGeometry = class extends Geo { constructor(r, h, seg = 8) { const g = lathe(0, r, h, seg); super(g.v, g.f); } };
  T.SphereGeometry = class extends Geo { constructor(r, ws = 8, hs = 6, ps = 0, pl = Math.PI * 2, ts = 0, tl = Math.PI) { const v = [], f = [];
    for (let j = 0; j <= hs; j++) for (let i = 0; i <= ws; i++) { const th = ts + j / hs * tl, ph = ps + i / ws * pl; v.push([-r * Math.cos(ph) * Math.sin(th), r * Math.cos(th), r * Math.sin(ph) * Math.sin(th)]); }
    for (let j = 0; j < hs; j++) for (let i = 0; i < ws; i++) { const a = j * (ws + 1) + i, b = a + ws + 1; f.push([a, b, a + 1], [b, b + 1, a + 1]); }
    super(v, f); } };
  T.DodecahedronGeometry = class extends Geo { constructor(r) { const t = (1 + Math.sqrt(5)) / 2;
    const v = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(p => { const l = Math.hypot(...p); return p.map(c => c / l * r); });
    super(v, [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]]); } };
  T.IcosahedronGeometry = T.DodecahedronGeometry;
  T.PlaneGeometry = class extends Geo { constructor(w, h) { super([[-w / 2, -h / 2, 0], [w / 2, -h / 2, 0], [w / 2, h / 2, 0], [-w / 2, h / 2, 0]], [[0, 1, 2], [0, 2, 3]]); } };
  T.TorusGeometry = class extends Geo { constructor() { super([], []); } };
  class Mat { constructor(o = {}) { this.uuid = 'm' + (uid++); this.color = new Color('#ffffff'); this.emissive = new Color(0, 0, 0); this.emissiveIntensity = 1; this.opacity = 1;
      for (const k in o) { if (k === 'color' || k === 'emissive') this[k] = o[k] instanceof Color ? o[k].clone() : new Color(o[k]); else this[k] = o[k]; } }
    clone() { const m = new this.constructor({}); Object.assign(m, this); m.uuid = 'm' + (uid++); m.color = this.color.clone(); m.emissive = this.emissive.clone(); return m; } }
  T.MeshStandardMaterial = class extends Mat {}; T.MeshBasicMaterial = class extends Mat {};
  T.CanvasTexture = class { constructor(c) { this.image = c; } };
  class Obj { constructor() { this.position = new V3(); this.rotation = new V3(); this.scale = new V3(1, 1, 1); this.children = []; this.userData = {}; this.visible = true; }
    add(...o) { for (const c of o) { c.parent = this; this.children.push(c); } return this; } remove(o) { this.children = this.children.filter(c => c !== o); return this; }
    traverse(fn) { fn(this); this.children.forEach(c => c.traverse(fn)); } rotateY(a) { this.rotation.y += a; return this; }
    translateX(d) { this.position.x += d; return this; } translateZ(d) { this.position.z += d; return this; } }
  T.Group = class extends Obj {}; T.Object3D = Obj;
  T.Mesh = class extends Obj { constructor(g, m) { super(); this.geometry = g; this.material = m; this.isMesh = true; } };
  // matrices
  const mul = (a, b) => { const r = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) r[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j]; return r; };
  function local(o) {
    const { x, y, z } = o.rotation, cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
    const Rx = [1, 0, 0, 0, 0, cx, -sx, 0, 0, sx, cx, 0, 0, 0, 0, 1], Ry = [cy, 0, sy, 0, 0, 1, 0, 0, -sy, 0, cy, 0, 0, 0, 0, 1], Rz = [cz, -sz, 0, 0, sz, cz, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const S = [o.scale.x, 0, 0, 0, 0, o.scale.y, 0, 0, 0, 0, o.scale.z, 0, 0, 0, 0, 1], Tm = [1, 0, 0, o.position.x, 0, 1, 0, o.position.y, 0, 0, 1, o.position.z, 0, 0, 0, 1];
    return mul(Tm, mul(mul(mul(Rx, Ry), Rz), S));
  }
  const ap = (m, [x, y, z]) => [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]];
  // render a group into a canvas cell
  T.renderCell = function (ctx, root, cx, cy, w, h, opts = {}) {
    const yaw = opts.yaw ?? .65, pitch = opts.pitch ?? .55, tris = [];
    const L = (() => { const l = [-.55, .75, .4]; const n = Math.hypot(...l); return l.map(c => c / n); })();
    (function walk(o, m) { if (!o.visible) return; const M = mul(m, local(o));
      if (o.isMesh && !o.material.map && !o.material.transparent) {
        const vs = o.geometry.v.map(p => ap(M, p));
        for (const [a, b, c] of o.geometry.f) {
          const A = vs[a], B = vs[b], C = vs[c];
          const u = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], v = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
          let n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]]; const nl = Math.hypot(...n) || 1; n = n.map(q => q / nl);
          tris.push({ p: [A, B, C], n, mat: o.material });
        } }
      o.children.forEach(c => walk(c, M)); })(root, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    const cyw = Math.cos(yaw), syw = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const view = ([x, y, z]) => { const X = x * cyw - z * syw, Z0 = x * syw + z * cyw; return [X, y * cp - Z0 * sp, y * sp + Z0 * cp]; };
    const vdir = [syw * cp, sp, cyw * cp];
    let mnx = 1e9, mxx = -1e9, mny = 1e9, mxy = -1e9;
    for (const t of tris) { t.q = t.p.map(view); for (const q of t.q) { mnx = Math.min(mnx, q[0]); mxx = Math.max(mxx, q[0]); mny = Math.min(mny, q[1]); mxy = Math.max(mxy, q[1]); } t.d = (t.q[0][2] + t.q[1][2] + t.q[2][2]) / 3; }
    const sc = opts.scale || Math.min(w / (mxx - mnx), h / (mxy - mny)) * .86, ox = cx + w / 2 - (mnx + mxx) / 2 * sc, oy = cy + h / 2 + (mny + mxy) / 2 * sc;
    tris.sort((a, b) => a.d - b.d);
    for (const t of tris) {
      let n = t.n; if (n[0] * vdir[0] + n[1] * vdir[1] + n[2] * vdir[2] < 0) n = n.map(q => -q);
      const lam = Math.max(0, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]), sh = .42 + .18 * (n[1] * .5 + .5) + .55 * lam;
      const c = t.mat.color, e = t.mat.emissive, ei = t.mat.emissiveIntensity * (opts.night ? 1.4 : .25);
      const r = Math.min(255, (c.r * sh + e.r * ei) * 255), g = Math.min(255, (c.g * sh + e.g * ei) * 255), b = Math.min(255, (c.b * sh + e.b * ei) * 255);
      ctx.fillStyle = ctx.strokeStyle = `rgb(${r | 0},${g | 0},${b | 0})`; ctx.lineWidth = .6;
      ctx.beginPath(); t.q.forEach((q, i) => { const X = ox + q[0] * sc, Y = oy - q[1] * sc; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); ctx.fill(); ctx.stroke();
    }
    return sc;
  };
  window.THREE = T;
})();
