import type { ShellType } from '../../types';

export interface ShotVolley {
  shells: ShellType[];
  processedShells: number;
  liveShells: number;
  blankShells: number;
  damage: number;
  anyLive: boolean;
}

/**
 * Resolves the shells consumed by one trigger pull. Choke consumes two shells
 * only when two remain; Saw doubles the damage produced by every live shell.
 */
export const resolveShotVolley = (
  chamber: ShellType[],
  currentShellIndex: number,
  isChoked: boolean,
  isSawed: boolean
): ShotVolley => {
  const remaining = Math.max(0, chamber.length - currentShellIndex);
  const processedShells = isChoked && remaining >= 2 ? 2 : Math.min(1, remaining);
  const shells = chamber.slice(currentShellIndex, currentShellIndex + processedShells);
  const liveShells = shells.filter(shell => shell === 'LIVE').length;
  const blankShells = shells.length - liveShells;

  return {
    shells,
    processedShells,
    liveShells,
    blankShells,
    damage: liveShells * (isSawed ? 2 : 1),
    anyLive: liveShells > 0
  };
};
