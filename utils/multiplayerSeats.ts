import { AimTarget, GameState, MultiplayerPlayer, TurnOwner } from '../types';

export const ownersForPlayerCount = (playerCount: number): TurnOwner[] => {
  if (playerCount >= 4) return ['PLAYER', 'PLAYER3', 'DEALER', 'PLAYER4'];
  if (playerCount === 3) return ['PLAYER', 'PLAYER3', 'DEALER'];
  return ['PLAYER', 'DEALER'];
};

export const phaseForOwner = (owner: TurnOwner): GameState['phase'] => {
  if (owner === 'PLAYER3') return 'PLAYER3_TURN';
  if (owner === 'PLAYER4') return 'PLAYER4_TURN';
  if (owner === 'DEALER') return 'DEALER_TURN';
  return 'PLAYER_TURN';
};

export const ownerToPlayerId = (
  owner: TurnOwner,
  localPlayerId: string,
  players: MultiplayerPlayer[]
): string | undefined => {
  const localIndex = players.findIndex(player => player.id === localPlayerId);
  if (localIndex === -1 || players.length < 2) return undefined;
  const offsetByOwner: Record<TurnOwner, number> = players.length === 2
    ? { PLAYER: 0, DEALER: 1, PLAYER3: 1, PLAYER4: 1 }
    : players.length === 3
      ? { PLAYER: 0, PLAYER3: 1, DEALER: 2, PLAYER4: 2 }
      : { PLAYER: 0, PLAYER3: 1, DEALER: 2, PLAYER4: 3 };
  return players[(localIndex + offsetByOwner[owner]) % players.length]?.id;
};

export const playerIdToOwner = (
  playerId: string,
  localPlayerId: string,
  players: MultiplayerPlayer[]
): TurnOwner => {
  if (!playerId || playerId === localPlayerId) return 'PLAYER';
  const localIndex = players.findIndex(player => player.id === localPlayerId);
  const targetIndex = players.findIndex(player => player.id === playerId);
  if (localIndex === -1 || targetIndex === -1 || players.length < 2) return 'DEALER';
  const offset = (targetIndex - localIndex + players.length) % players.length;
  if (offset === 1 && players.length >= 3) return 'PLAYER3';
  if (offset === 3 && players.length >= 4) return 'PLAYER4';
  return 'DEALER';
};

export const normalizePlayerReference = (
  playerOrOwner: string,
  localPlayerId: string,
  players: MultiplayerPlayer[]
): TurnOwner => {
  if ((['PLAYER', 'PLAYER3', 'PLAYER4', 'DEALER'] as string[]).includes(playerOrOwner)) {
    const absoluteId = ownerToPlayerId(playerOrOwner as TurnOwner, localPlayerId, players);
    return absoluteId ? playerIdToOwner(absoluteId, localPlayerId, players) : 'DEALER';
  }
  return playerIdToOwner(playerOrOwner, localPlayerId, players);
};

export const replaceSeatLabelsWithPlayerNames = (
  text: string,
  localPlayerId: string,
  players: MultiplayerPlayer[]
): string => {
  if (!localPlayerId || players.length < 2) return text;
  const fallbackNames: Record<TurnOwner, string> = {
    PLAYER: 'PLAYER',
    DEALER: 'DEALER',
    PLAYER3: 'PLAYER3',
    PLAYER4: 'PLAYER4',
  };
  const namesByOwner = (Object.keys(fallbackNames) as TurnOwner[]).reduce<Record<TurnOwner, string>>((names, owner) => {
    const absolutePlayerId = ownerToPlayerId(owner, localPlayerId, players);
    names[owner] = players.find(player => player.id === absolutePlayerId)?.name?.toUpperCase() || owner;
    return names;
  }, { ...fallbackNames });

  return text.replace(/\b(PLAYER4|PLAYER3|DEALER|PLAYER)\b/gi, label => (
    namesByOwner[label.toUpperCase() as TurnOwner] || label
  ));
};

export const aimForOwner = (owner: TurnOwner): AimTarget => {
  if (owner === 'PLAYER') return 'SELF';
  if (owner === 'PLAYER3') return 'LEFT';
  if (owner === 'PLAYER4') return 'RIGHT';
  return 'OPPONENT';
};

export const nextAliveOwner = (
  currentOwner: TurnOwner,
  playerCount: number,
  getHp: (owner: TurnOwner) => number
): TurnOwner => {
  const owners = ownersForPlayerCount(playerCount);
  const currentIndex = Math.max(0, owners.indexOf(currentOwner));
  for (let distance = 1; distance <= owners.length; distance += 1) {
    const candidate = owners[(currentIndex + distance) % owners.length];
    if (getHp(candidate) > 0) return candidate;
  }
  return currentOwner;
};
