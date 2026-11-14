import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useScroll } from 'motion/react';
import { getFanTeamId, getFanTeamName, getTeamColor } from '@/lib/f1Types';

import { buildEngine } from '@/lib/powerUnit/engine.js';

type V3 = [number, number, number];
const PU_HOME: V3 = [-1.0, 0.34, 0];
const CAR_END = 0.58;
interface Part { group: THREE.Group; move: V3; at: number; label?: string; anchor: V3 }

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c); };

// Bodywork primitive: a squircle tube along x whose width/height/centre follow prof(t), t=0 rear, t=1 front.
function tube(len: number, prof: (t: number) => V3, n = 4) {
  const g = new THREE.CylinderGeometry(1, 1, len, 36, 28);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const along = p.getY(i), cx = p.getX(i), cz = p.getZ(i), r = Math.hypot(cx, cz);
    const k = r > 1e-6 ? 1 / Math.pow(Math.pow(Math.abs(cx / r), n) + Math.pow(Math.abs(cz / r), n), 1 / n) : 0;
    const [w, h, y] = prof(along / len + 0.5);
    p.setXYZ(i, along, (cx * k * h) / 2 + y, (-cz * k * w) / 2);
  }
  g.computeVertexNormals();
  return g;
}

function buildCar(color: string) {
  const paint = new THREE.MeshPhysicalMaterial({ color, metalness: 0.35, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.12 });
  const carbon = new THREE.MeshStandardMaterial({ color: 0x17191c, metalness: 0.45, roughness: 0.5 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x0b0b0c, roughness: 0.92 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xa3a9af, metalness: 0.95, roughness: 0.3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x050506, roughness: 0.75 });
  const white = new THREE.MeshPhysicalMaterial({ color: 0xf2ece0, roughness: 0.3, clearcoat: 1 });
  const light = new THREE.MeshStandardMaterial({ color: 0xff2020, emissive: 0xff2020, emissiveIntensity: 2 });

  const root = new THREE.Group();
  const parts: Part[] = [];
  const part = (move: V3, at: number, anchor: V3, label?: string) => {
    const group = new THREE.Group();
    root.add(group);
    parts.push({ group, move, at, label, anchor });
    return group;
  };
  const add = (g: THREE.Group, geo: THREE.BufferGeometry, mat: THREE.Material, pos: V3 = [0, 0, 0], rot: V3 = [0, 0, 0]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    g.add(m);
    return m;
  };
  const box = (g: THREE.Group, size: V3, mat: THREE.Material, pos: V3, rot?: V3) => add(g, new THREE.BoxGeometry(...size), mat, pos, rot);
  const rod = (g: THREE.Group, a: V3, b: V3, r: number, mat: THREE.Material) => {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const m = add(g, new THREE.CylinderGeometry(r, r, va.distanceTo(vb), 10), mat);
    m.position.copy(va).lerp(vb, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  };

  const cell = part([0, 0, 0], 0, [0.9, 0.6, 0], 'Survival cell');
  add(cell, tube(2.1, t => [lerp(0.66, 0.44, t), lerp(0.6, 0.36, t), lerp(0.43, 0.37, t)]), paint, [0.45, 0, 0]);
  add(cell, tube(0.78, t => [lerp(0.34, 0.26, t), 0.16, 0.66]), dark, [0.3, 0, 0]);
  add(cell, new THREE.SphereGeometry(0.125, 24, 16), white, [0.22, 0.72, 0]);

  const wing = part([1.5, -0.05, 0], 0, [2.95, 0.2, 0.5], 'Front wing');
  box(wing, [0.42, 0.025, 1.84], carbon, [2.95, 0.09, 0]);
  for (const s of [-1, 1]) {
    box(wing, [0.3, 0.02, 0.72], paint, [2.78, 0.17, s * 0.52], [0, 0, 0.25]);
    box(wing, [0.24, 0.02, 0.7], carbon, [2.66, 0.25, s * 0.53], [0, 0, 0.42]);
    box(wing, [0.5, 0.2, 0.02], paint, [2.85, 0.17, s * 0.92]);
  }

  const nose = part([0.85, 0.25, 0], 0.06, [2.3, 0.4, 0], 'Nose cone');
  add(nose, tube(1.55, t => [lerp(0.44, 0.16, t ** 1.2), lerp(0.36, 0.1, t), lerp(0.37, 0.2, t)]), paint, [2.27, 0, 0]);

  const tyreGeo = (r: number, w: number) => {
    const g = new THREE.LatheGeometry([[r - 0.13, -w / 2], [r - 0.03, -w / 2], [r, -w / 2 + 0.04], [r, w / 2 - 0.04], [r - 0.03, w / 2], [r - 0.13, w / 2]]
      .map(([x, y]) => new THREE.Vector2(x, y)), 48);
    g.rotateX(Math.PI / 2);
    return g;
  };
  const disc = (r: number, h: number) => { const g = new THREE.CylinderGeometry(r, r, h, 40); g.rotateX(Math.PI / 2); return g; };
  for (const [x, w, front] of [[1.75, 0.32, true], [-1.7, 0.4, false]] as const) {
    for (const s of [-1, 1]) {
      const wheel = part([0, 0, s * 1.25], 0.1, [x, 0.75, s * 0.8], front && s === 1 ? 'Wheel & tyre' : undefined);
      add(wheel, tyreGeo(0.36, w), rubber, [x, 0.36, s * 0.8]);
      add(wheel, disc(0.235, w * 0.92), dark, [x, 0.36, s * 0.8]);
      add(wheel, disc(0.225, 0.02), paint, [x, 0.36, s * (0.8 + w / 2 - 0.02)]);
      add(wheel, disc(0.07, 0.03), metal, [x, 0.36, s * (0.8 + w / 2 - 0.01)]);

      const susp = part([0, 0, s * 0.55], 0.16, [x, 0.5, s * 0.45], front && s === 1 ? 'Suspension & brakes' : undefined);
      for (const y of [0.5, 0.2]) for (const dx of [-0.26, 0.26]) rod(susp, [x + dx, y + 0.02, s * 0.2], [x, y, s * 0.62], 0.014, carbon);
      rod(susp, [x + 0.05, 0.52, s * 0.18], [x, 0.24, s * 0.6], 0.012, metal);
      add(susp, disc(0.17, 0.03), metal, [x, 0.36, s * 0.63]);
      box(susp, [0.1, 0.16, 0.05], paint, [x - 0.1, 0.36, s * 0.63]);
    }
  }

  const rear = part([-1.2, 0.75, 0], 0.12, [-2.6, 1.05, 0], 'Rear wing');
  for (const s of [-1, 1]) box(rear, [0.62, 0.62, 0.02], paint, [-2.62, 0.72, s * 0.5]);
  box(rear, [0.4, 0.03, 1.0], carbon, [-2.6, 0.98, 0], [0, 0, 0.15]);
  box(rear, [0.24, 0.02, 1.0], paint, [-2.78, 1.06, 0], [0, 0, 0.5]);
  box(rear, [0.25, 0.02, 0.96], carbon, [-2.55, 0.5, 0]);
  box(rear, [0.3, 0.5, 0.03], carbon, [-2.5, 0.7, 0]);

  const cover = part([-0.2, 1.5, 0], 0.2, [-1.3, 0.9, 0], 'Engine cover');
  add(cover, tube(2.3, t => [lerp(0.16, 0.6, t ** 0.8), lerp(0.3, 0.78, t ** 0.7), lerp(0.42, 0.62, t)]), paint, [-1.55, 0, 0]);
  add(cover, tube(0.12, () => [0.22, 0.16, 0.88]), dark, [-0.36, 0, 0]);
  box(cover, [1.1, 0.3, 0.015], paint, [-1.95, 0.74, 0]);

  for (const s of [-1, 1]) {
    const pod = part([0, 0.25, s * 1.0], 0.26, [-0.3, 0.5, s * 0.6], s === 1 ? 'Sidepod & radiators' : undefined);
    add(pod, tube(2.0, t => [lerp(0.2, 0.5, t ** 0.6), lerp(0.14, 0.44, t ** 0.8), lerp(0.2, 0.36, t)]), paint, [-0.75, 0, s * 0.6]);
    box(pod, [0.04, 0.2, 0.36], dark, [0.26, 0.4, s * 0.6]);
    box(pod, [0.5, 0.3, 0.04], metal, [-0.3, 0.33, s * 0.42], [0, s * 0.25, 0]);
  }

  const floorShape = new THREE.Shape([[1.5, 0.3], [0.9, 0.78], [-1.9, 0.8], [-2.35, 0.55], [-2.35, -0.55], [-1.9, -0.8], [0.9, -0.78], [1.5, -0.3]]
    .map(([x, y]) => new THREE.Vector2(x, y)));
  const floorGeo = new THREE.ExtrudeGeometry(floorShape, { depth: 0.035, bevelEnabled: false });
  floorGeo.rotateX(Math.PI / 2);
  const floor = part([0, -0.75, 0], 0.3, [-0.6, 0.06, 0.7], 'Floor & diffuser');
  add(floor, floorGeo, carbon, [0, 0.08, 0]);
  box(floor, [0.5, 0.02, 1.0], carbon, [-2.45, 0.15, 0], [0, 0, -0.3]);
  box(floor, [2.6, 0.012, 0.3], new THREE.MeshStandardMaterial({ color: 0x6b4a2b, roughness: 0.8 }), [-0.3, 0.036, 0]);

  const halo = part([0, 1.0, 0], 0.34, [0.7, 0.85, 0], 'Halo');
  const hoop = new THREE.TorusGeometry(0.27, 0.032, 12, 40, Math.PI);
  hoop.rotateX(Math.PI / 2); hoop.rotateY(Math.PI / 2); hoop.scale(1.6, 1, 1);
  add(halo, hoop, carbon, [0.45, 0.8, 0]);
  for (const s of [-1, 1]) rod(halo, [0.45, 0.8, s * 0.27], [-0.12, 0.72, s * 0.3], 0.032, carbon);
  rod(halo, [0.88, 0.8, 0], [1.02, 0.55, 0], 0.028, carbon);

  const box2 = part([-0.9, 0, 0], 0.4, [-2.0, 0.5, 0], 'Gearbox');
  add(box2, tube(0.95, t => [lerp(0.2, 0.32, t), lerp(0.2, 0.3, t), 0.36]), metal, [-2.0, 0, 0]);
  add(box2, tube(0.4, t => [lerp(0.08, 0.2, t), lerp(0.08, 0.2, t), 0.36]), carbon, [-2.66, 0, 0]);
  box(box2, [0.03, 0.1, 0.05], light, [-2.87, 0.36, 0]);

  const pu = part([-0.15, 0.7, 0], 0.46, [-1.0, 0.75, 0], 'Power unit · 1.6 V6 turbo hybrid');
  const engine = buildEngine();
  engine.root.scale.setScalar(0.00115);
  engine.root.rotation.y = Math.PI / 2;
  engine.root.position.set(...PU_HOME);
  pu.add(engine.root);

  const es = part([0, -0.35, 0], 0.5, [-0.35, 0.2, 0.2], 'Energy store');
  box(es, [0.5, 0.14, 0.4], dark, [-0.35, 0.2, 0]);
  box(es, [0.5, 0.02, 0.06], paint, [-0.35, 0.275, 0]);

  return { root, parts, engine, pu };
}

const CSS = `
.ct { position: relative; height: 520vh; background: #0a0a0a; color: #f2ece0; }
.ct-stick { position: sticky; top: 0; height: 100vh; overflow: hidden;
  background: radial-gradient(ellipse 60% 50% at 50% 55%, rgba(var(--mercedes-rgb), .16), transparent 70%), #0a0a0a; }
.ct-stick canvas { position: absolute; inset: 0; width: 100%; height: 100%; display: block; cursor: grab; touch-action: pan-y; }
.ct-stick canvas:active { cursor: grabbing; }
.ct-head { position: absolute; left: clamp(20px, 3vw, 56px); top: clamp(24px, 5vh, 56px); max-width: 520px; pointer-events: none; }
.ct-mono { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; }
.ct-label { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 8px; white-space: nowrap; pointer-events: none;
  opacity: 0; transition: opacity .35s; will-change: transform; }
.ct-label i { width: 7px; height: 7px; background: var(--mercedes); flex-shrink: 0; }
.ct-label span { background: rgba(10,10,10,.72); padding: 4px 8px; border-left: 1px solid var(--mercedes); }
.ct-bar { position: absolute; left: 0; bottom: 0; height: 3px; width: 100%; background: var(--mercedes); transform-origin: left; transform: scaleX(0); }
@media (max-width: 760px) { .ct-label span { font-size: 8px; padding: 3px 6px; } }
`;

export default function CarTeardown() {
  const section = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const caption = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const teamId = getFanTeamId();

  useEffect(() => {
    const el = canvas.current!, labelHost = labels.current!;
    const renderer = new THREE.WebGLRenderer({ canvas: el, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 5);
    scene.add(key);

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const { root, parts, engine, pu } = buildCar(getTeamColor(teamId));
    scene.add(root);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x30343a, 0.7));
    renderer.localClippingEnabled = true;
    const target = new THREE.Vector3();
    let th = 0, last = performance.now();

    const sc = document.createElement('canvas');
    sc.width = sc.height = 128;
    const ctx = sc.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,.85)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 128, 128);
    const shadowMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false });
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 3.6), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    scene.add(shadow);

    const tags = parts.map(p => {
      if (!p.label) return null;
      const d = document.createElement('div');
      d.className = 'ct-label ct-mono';
      d.innerHTML = '<i></i><span></span>';
      d.querySelector('span')!.textContent = p.label;
      labelHost.appendChild(d);
      return d;
    });

    let w = 0, h = 0, visible = true, cur = scrollYProgress.get(), raf = 0;
    const resize = () => {
      w = el.clientWidth; h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    let spinAz = 0, spinEl = 0, drag: { x: number; y: number } | null = null;
    const down = (e: PointerEvent) => { drag = { x: e.clientX, y: e.clientY }; el.setPointerCapture(e.pointerId); };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      spinAz -= (e.clientX - drag.x) * 0.006;
      spinEl = Math.min(0.9, Math.max(-0.35, spinEl + (e.clientY - drag.y) * 0.004));
      drag = { x: e.clientX, y: e.clientY };
    };
    const up = () => { drag = null; };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(el);
    const v = new THREE.Vector3();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || !w) return;
      cur += (scrollYProgress.get() - cur) * 0.12;
      const now = performance.now();
      th = (th + (now - last) * 0.14) % 720;
      last = now;
      const p = Math.min(1, cur / CAR_END);
      const dive = smooth((cur - CAR_END - 0.04) / 0.2);
      const fit = Math.min(2.4, Math.max(1, 1.5 / camera.aspect));
      const az = 0.6 + p * 0.55 + dive * 0.5 + spinAz, elv = Math.min(1.45, Math.max(0.03, 0.26 + p * 0.2 - dive * 0.12 + spinEl));
      const dist = lerp(8.2 + p * 4.6, 2.5, dive) * fit;

      parts.forEach((part, i) => {
        const e = smooth((p - part.at) / 0.45);
        part.group.position.set(part.move[0] * e, part.move[1] * e, part.move[2] * e);
        const tag = tags[i];
        if (!tag) return;
        v.set(part.anchor[0], part.anchor[1], part.anchor[2]).add(part.group.position).project(camera);
        tag.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px) translateY(-50%)`;
        tag.style.opacity = dive < 0.2 && (e > 0.55 || (part.move.every(m => m === 0) && p > 0.5)) ? '1' : '0';
      });

      target.set(-0.1, 0.5 + p * 0.25, 0).lerp(v.set(...PU_HOME).add(pu.position).setY(pu.position.y + PU_HOME[1] + 0.12), dive);
      camera.position.set(target.x + Math.sin(az) * Math.cos(elv) * dist, target.y + Math.sin(elv) * dist, target.z + Math.cos(az) * Math.cos(elv) * dist);
      camera.lookAt(target);
      shadowMat.opacity = (1 - p * 0.65) * (1 - dive);
      engine.update(th, { explode: smooth((cur - CAR_END - 0.2) / 0.2), arrows: 0, charge: 1 });
      if (caption.current) caption.current.style.opacity = dive > 0.6 ? '1' : '0';
      if (bar.current) bar.current.style.transform = `scaleX(${cur})`;
      renderer.render(scene, camera);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect(); io.disconnect();
      el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
      tags.forEach(t => t?.remove());
      scene.traverse(o => {
        if (o instanceof THREE.Mesh) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); }
      });
      pmrem.dispose();
      renderer.dispose();
    };
  }, [scrollYProgress, teamId]);

  return (
    <section className="ct" ref={section} aria-label="Car teardown">
      <style>{CSS}</style>
      <div className="ct-stick">
        <canvas ref={canvas} role="img" aria-label={`A ${getFanTeamName()} coloured Formula 1 car that comes apart into its main assemblies as you scroll`} />
        <div ref={labels} aria-hidden />
        <div className="ct-head">
          <div className="ct-mono" style={{ color: 'var(--mercedes)', fontWeight: 800 }}>Strip it down</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05, marginTop: 10 }}>
            What's under the <em style={{ color: 'var(--mercedes)', fontWeight: 700 }}>bodywork</em>
          </h2>
          <div className="ct-mono" style={{ color: '#8a8172', marginTop: 14 }}>Scroll to tear down · drag to spin · illustrative bodywork</div>
        </div>
        <div ref={caption} style={{ position: 'absolute', left: 'clamp(20px, 3vw, 56px)', bottom: 'clamp(28px, 6vh, 64px)', maxWidth: 440, opacity: 0, transition: 'opacity .5s', pointerEvents: 'none' }}>
          <div className="ct-mono" style={{ color: 'var(--mercedes)', fontWeight: 800 }}>The power unit</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(22px, 2.6vw, 34px)', fontWeight: 500, lineHeight: 1.1, marginTop: 8 }}>1.6 litre V6 turbo hybrid</div>
          <div className="ct-mono" style={{ color: '#8a8172', marginTop: 10, lineHeight: 1.8 }}>90° V6 · three shared crankpins · firing 1-4-3-6-5-2<br />Turbocharger over the valley · MGU-K geared to the crank</div>
        </div>
        <div className="ct-bar" ref={bar} />
      </div>
    </section>
  );
}
