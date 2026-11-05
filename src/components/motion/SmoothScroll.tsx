import { ReactLenis } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { useReducedMotion } from 'motion/react';

export default function SmoothScroll() {
  return useReducedMotion() ? null : <ReactLenis root options={{ lerp: 0.1, anchors: true }} />;
}
