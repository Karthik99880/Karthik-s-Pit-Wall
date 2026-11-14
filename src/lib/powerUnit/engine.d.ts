import type { Group } from 'three';

export function buildEngine(opts?: { plain?: boolean; lo?: boolean; caps?: string }): {
  root: Group;
  update(th: number, ops?: { explode?: number; charge?: number; arrows?: number; solo?: number; fade?: number; fire?: number }): void;
};
