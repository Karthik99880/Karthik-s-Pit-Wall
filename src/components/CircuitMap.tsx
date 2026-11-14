import { useEffect, useMemo, useRef, useState } from 'react';
import { CIRCUIT_VIEWBOX } from '@/lib/circuitPaths';

const ANTICLOCKWISE = new Set(['jeddah', 'miami', 'imola', 'baku', 'marina_bay', 'americas', 'interlagos', 'vegas', 'yas_marina']);

const CSS = `
.cm { position: relative; color: var(--ink-3); }
.cm svg { display: block; width: 100%; max-height: 200px; overflow: visible; margin: 6px 0 8px; }
.cm-mono { font-family: var(--font-mono); font-size: 9px; letter-spacing: .16em; text-transform: uppercase; }
.cm-draw { stroke-dasharray: 1000; animation: cmDraw 2.4s cubic-bezier(.16,1,.3,1) both; }
@keyframes cmDraw { from { stroke-dashoffset: 1000; } to { stroke-dashoffset: 0; } }
@media (prefers-reduced-motion: reduce) { .cm-draw { animation: none; } }
`;

type Pt = [number, number];
const dist = (a: Pt, b: Pt) => Math.hypot(b[0] - a[0], b[1] - a[1]);

// ponytail: O(n^2) chord scan over ~200 points per circuit; precompute in the generator if maps ever multiply
export function analyse(d: string) {
  const pts = d.slice(1, -1).split('L').map(p => p.split(' ').map(Number) as Pt);
  const n = pts.length;
  const at = (i: number) => pts[i % n];
  let area = 0, total = 0;
  for (let i = 0; i < n; i++) {
    area += at(i)[0] * at(i + 1)[1] - at(i + 1)[0] * at(i)[1];
    total += dist(at(i), at(i + 1));
  }
  let best = { a: pts[0], b: pts[0], len: 0 };
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < i + n; j++) {
      const a = at(i), b = at(j), len = dist(a, b);
      let straight = true;
      for (let k = i + 1; k < j && straight; k++) {
        const p = at(k);
        straight = Math.abs((b[0] - a[0]) * (a[1] - p[1]) - (a[0] - p[0]) * (b[1] - a[1])) / (len || 1) < 1.6;
      }
      if (!straight) break;
      if (len > best.len) best = { a, b, len };
    }
  }
  return { start: pts[0], next: pts[1], clockwise: area > 0, total, straight: best };
}

export default function CircuitMap({ id, d, name, lengthKm, lapSeconds }: { id: string; d: string; name: string; lengthKm: number; lapSeconds?: number }) {
  const g = useMemo(() => analyse(d), [d]);
  const svg = useRef<SVGSVGElement>(null);
  const [go, setGo] = useState(false);
  const ran = useRef(false);
  useEffect(() => {
    if (!svg.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(svg.current);
    return () => io.disconnect();
  }, []);
  const wantClockwise = !ANTICLOCKWISE.has(id);
  const forward = g.clockwise === wantClockwise;
  const { a, b, len } = g.straight;
  const metres = Math.round((len / g.total) * lengthKm * 100) * 10;
  const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const sfAngle = (Math.atan2(g.next[1] - g.start[1], g.next[0] - g.start[0]) * 180) / Math.PI + 90;

  return (
    <div className="cm">
      <style>{CSS}</style>
      <div className="cm-mono" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>{wantClockwise ? 'Clockwise ↻' : 'Anticlockwise ↺'}</span>
        <span>N ↑</span>
      </div>

      <svg ref={svg} viewBox={CIRCUIT_VIEWBOX} role="img" aria-label={`${name} track layout, ${wantClockwise ? 'clockwise' : 'anticlockwise'}`}>
        <path d={d} pathLength={1000} className="cm-draw" fill="none" stroke="var(--ink)" strokeWidth={3} strokeLinejoin="round" />
        <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="var(--mercedes-ink)" strokeWidth={3} strokeLinecap="round" />
        {go && (
          <g>
            <g fill="var(--mercedes-ink)" stroke="var(--paper-2)" strokeWidth={0.5}>
              <rect x={-7} y={-1.3} width={13} height={2.6} rx={1.2} />
              <rect x={5} y={-3.4} width={1.6} height={6.8} />
              <rect x={-8} y={-3} width={1.6} height={6} />
              {[[-6, -4.2], [-6, 2.4], [2, -4.2], [2, 2.4]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width={3.2} height={1.8} fill="var(--ink)" stroke="none" />)}
            </g>
            <animateMotion ref={el => { if (el && !ran.current) { ran.current = true; (el as SVGAnimationElement).beginElement(); } }} path={d} begin="indefinite" dur={`${Math.max(6, (lapSeconds ?? 90) / 9)}s`} fill="freeze"
              rotate={forward ? 'auto' : 'auto-reverse'} calcMode="linear" keyPoints={forward ? '0;1' : '1;0'} keyTimes="0;1" />
          </g>
        )}
        <g transform={`translate(${g.start[0]} ${g.start[1]}) rotate(${sfAngle})`}>
          <rect x={-8} y={-2} width={16} height={4} fill="var(--paper)" stroke="var(--ink)" strokeWidth={0.6} />
          {[-8, 0].map(x => <rect key={x} x={x} y={-2} width={4} height={2} fill="var(--ink)" />)}
          {[-4, 4].map(x => <rect key={x} x={x} y={0} width={4} height={2} fill="var(--ink)" />)}
        </g>
        <text x={mid[0]} y={mid[1] - 9} textAnchor="middle" fill="var(--ink)" stroke="var(--paper-2)" strokeWidth={3} paintOrder="stroke" style={{ fontFamily: 'var(--font-mono)', fontSize: 7, fontWeight: 700, letterSpacing: '0.08em' }}>
          ≈{metres} M
        </text>
      </svg>

      <div className="cm-mono" style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        <span><i style={{ display: 'inline-block', width: 14, height: 3, background: 'var(--mercedes-ink)', verticalAlign: 'middle', marginRight: 7 }} />Longest straight</span>
        <span><i style={{ display: 'inline-block', width: 10, height: 5, background: 'repeating-linear-gradient(90deg, var(--ink) 0 3px, var(--paper) 3px 6px)', verticalAlign: 'middle', marginRight: 7 }} />Start / finish</span>
      </div>
    </div>
  );
}
