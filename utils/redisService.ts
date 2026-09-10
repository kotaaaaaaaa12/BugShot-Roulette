import type { GameStats } from './statsManager';

const TOKEN_KEY = 'aadish_roulette_auth_token';

export interface UserData {
    username: string;
    passwordHash: string;
    stats: GameStats;
    isDeveloper?: boolean;
}

export interface LeaderboardEntry {
    username: string;
    wins: number;
    losses: number;
    hardModeWins: number;
    isDeveloper?: boolean;
    stats: GameStats;
}

const emptyStats = (): GameStats => ({
    wins: 0,
    losses: 0,
    totalRounds: 0,
    shotsFired: 0,
    shotsHit: 0,
    selfShots: 0,
    damageDealt: 0,
    itemsUsed: 0,
    highestRound: 0,
    matchHistory: []
});

const createMatchHistorySignature = (entry: any): string => {
    const normalizedItems = Object.entries(entry?.itemsUsed || {})
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([item, count]) => `${item}:${count}`)
        .join('|');
    const mpPlayers = Array.isArray(entry?.mpPlayers)
        ? entry.mpPlayers.map((player: any) => `${player?.id || ''}:${player?.name || ''}:${player?.result || ''}`).join('~')
        : '';
    return [
        entry?.timestamp ?? '',
        entry?.result ?? '',
        entry?.roundsSurvived ?? '',
        entry?.shotsFired ?? '',
        entry?.shotsHit ?? '',
        entry?.damageDealt ?? '',
        entry?.totalScore ?? '',
        entry?.isHardMode ? 'hard' : 'normal',
        entry?.isMultiplayer ? 'mp' : 'sp',
        mpPlayers,
        normalizedItems
    ].join('|');
};

const buildStatsFromMatchHistory = (matchHistory: any[]): GameStats => {
    const dedupedEntries = (matchHistory || [])
        .filter((entry: any) => entry && typeof entry === 'object')
        .reduce((acc: { seen: Set<string>; entries: any[] }, entry: any) => {
            const signature = createMatchHistorySignature(entry);
            if (!signature || acc.seen.has(signature)) return acc;
            acc.seen.add(signature);
            acc.entries.push(entry);
            return acc;
        }, { seen: new Set<string>(), entries: [] as any[] })
        .entries.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))
        .slice(0, 20);

    const totals = dedupedEntries.reduce((acc: GameStats, entry: any) => {
        if (entry.result === 'WIN') acc.wins += 1;
        else if (entry.result === 'LOSS') acc.losses += 1;
        acc.totalRounds += entry.roundsSurvived || 0;
        acc.shotsFired += entry.shotsFired || 0;
        acc.shotsHit += entry.shotsHit || 0;
        acc.selfShots += entry.selfShots || 0;
        acc.damageDealt += entry.damageDealt || 0;
        acc.itemsUsed += Object.values(entry.itemsUsed || {})
            .reduce((sum: number, count: any) => sum + (Number(count) || 0), 0);
        acc.highestRound = Math.max(acc.highestRound, entry.roundsSurvived || 0);
        return acc;
    }, emptyStats());

    return { ...totals, matchHistory: dedupedEntries };
};

export const mergeGameStats = (localStats?: GameStats | null, remoteStats?: GameStats | null): GameStats => {
    const base = localStats ? { ...emptyStats(), ...localStats } : emptyStats();
    const incoming = remoteStats ? { ...emptyStats(), ...remoteStats } : emptyStats();
    return buildStatsFromMatchHistory([
        ...(base.matchHistory || []),
        ...(incoming.matchHistory || [])
    ]);
};

const apiRequest = async (path: string, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const response = await fetch(path, { ...init, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed: ${response.status}`);
    return data;
};

export const registerUser = async (
    username: string,
    password: string
): Promise<{ success: boolean; error?: string; user?: { username: string; stats: GameStats; isDeveloper?: boolean } }> => {
    try {
        const data = await apiRequest('/api/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
        return data;
    } catch (error: any) {
        return { success: false, error: error.message || 'Registration failed' };
    }
};

export const loginUser = async (
    username: string,
    password: string
): Promise<{ success: boolean; error?: string; user?: { username: string; stats: GameStats; isDeveloper?: boolean } }> => {
    try {
        const data = await apiRequest('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
        return data;
    } catch (error: any) {
        return { success: false, error: error.message || 'Login failed' };
    }
};

export const getUserStatsFromRedis = async (_username: string): Promise<GameStats | null> => {
    try {
        const data = await apiRequest('/api/stats');
        return data.stats || null;
    } catch (error) {
        console.error('Failed to fetch stats from D1:', error);
        return null;
    }
};

export const saveUserStatsToRedis = async (_username: string, stats: GameStats): Promise<boolean> => {
    try {
        await apiRequest('/api/stats', {
            method: 'PUT',
            body: JSON.stringify({ stats })
        });
        return true;
    } catch (error) {
        console.error('Failed to save stats to D1:', error);
        return false;
    }
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
    try {
        return await apiRequest('/api/leaderboard');
    } catch (error) {
        console.error('Failed to load leaderboard from D1:', error);
        return [];
    }
};
