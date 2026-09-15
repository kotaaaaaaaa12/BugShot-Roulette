import { japaneseExtended, japanesePatterns } from './i18nJa';

export type LanguagePreference = 'auto' | 'en' | 'ja';
export type ResolvedLanguage = 'en' | 'ja';

const SETTINGS_KEY = 'aadish_roulette_settings';

const metadataByLanguage: Record<ResolvedLanguage, {
  title: string;
  description: string;
  socialTitle: string;
  socialDescription: string;
  locale: string;
}> = {
  en: {
    title: 'Bugshot Roulette - The Ultimate Game of Chance',
    description: 'Play Bugshot Roulette - A high-stakes tabletop horror game where strategy meets luck. Inspired by Buckshot Roulette. Features 3D graphics, multiplayer, and intense item mechanics.',
    socialTitle: 'Bugshot Roulette - A Deadly Game of Chance',
    socialDescription: 'High-stakes tabletop horror game with 3D graphics, strategic items, and multiplayer. Play now!',
    locale: 'en_US',
  },
  ja: {
    title: 'Bugshot Roulette - 運と戦略のテーブルゲーム',
    description: '運と戦略が交差する3Dテーブルゲーム。マルチプレイと多彩なアイテムに対応しています。',
    socialTitle: 'Bugshot Roulette - 運と戦略のゲーム',
    socialDescription: '3Dグラフィック、多彩なアイテム、マルチプレイに対応したブラウザゲーム。',
    locale: 'ja_JP',
  },
};

const japanese: Record<string, string> = {
  'SETTINGS': '設定',
  'Display & Audio': '画面・音声',
  'Language': '言語',
  'Auto follows your browser language. Japanese is used for Japanese browsers; all other languages use English.': 'ブラウザの言語に合わせます。日本語環境では日本語、それ以外では英語を使用します。',
  'Graphics': 'グラフィック',
  'Resolution': '解像度',
  'Brightness': '明るさ',
  'HUD Scale': 'HUDサイズ',
  'Field of View': '視野角',
  'Graphics Quality Profile': 'グラフィック品質',
  'Select performance layout optimized for your device hardware.': '端末に合わせたパフォーマンス設定を選択します。',
  'High Quality': '高品質',
  'Balanced': 'バランス',
  'Potato (Ultra)': '超軽量',
  'Sound': 'サウンド',
  'Music': '音楽',
  'Effects': '効果音',
  'Developer': '開発者',
  'Debug Overlay': 'デバッグ表示',
  'Enables cheats, item management, and chamber editor': 'チート、アイテム管理、薬室編集を有効にします',
  'RESET TO DEFAULTS': '初期設定に戻す',
  'EXIT TO MAIN MENU': 'メインメニューに戻る',
  'CLOSE': '閉じる',
  'Customize your experience': 'プレイ環境を設定',
  'BUGSHOT ROULETTE': 'BUGSHOT ROULETTE',
  'A deadly game of chance and strategy': '運と戦略が交差するゲーム',
  'AGENT AUTHENTICATION': 'エージェント認証',
  'Agent Codename': 'コードネーム',
  'Password': 'パスワード',
  'SIGN IN': 'ログイン',
  'REGISTER': 'アカウント作成',
  'Agent Signed In': 'ログイン中',
  'LOG OUT': 'ログアウト',
  'REQ: 1-12 CHARS': '1～12文字',
  'REQ: 6-20 CHARS': '6～20文字',
  'Normal Mode': 'ノーマルモード',
  'Hard Mode': 'ハードモード',
  'High Stakes Protocol': '高難度モード',
  'HARD MODE PROTOCOL': 'ハードモード',
  'MULTIPLAYER': 'マルチプレイ',
  'Leaderboard': 'ランキング',
  'START GAME': 'ゲーム開始',
  'ACCEPT FATE': 'ゲームを始める',
  'QUICK MATCH': 'クイックマッチ',
  'ESTABLISH LOBBY': 'ロビーを作成',
  'JOIN LOBBY': 'ロビーに参加',
  'SHOW ROOMS': 'ロビー一覧',
  'ACTIVE NETWORKS BROWSER': '公開ロビー一覧',
  'Scanning Net Nodes...': 'ロビーを検索中…',
  'REFRESH': '更新',
  'Multiplayer Lobby': 'マルチプレイロビー',
  'Cooperative and Competitive Online Systems': 'オンライン対戦システム',
  'COPY CODE': 'コードをコピー',
  'COPY LINK': 'リンクをコピー',
  'COPIED': 'コピー済み',
  'LINK': 'リンク',
  'Match Configuration': 'マッチ設定',
  'Rounds to Win': '勝利に必要なラウンド数',
  'Starting Health Points': '開始時のHP',
  'Items per Shipment': '補給ごとのアイテム数',
  'RANDOM': 'ランダム',
  'Advanced Configuration': '詳細設定',
  'Customize item drop probabilities': 'アイテムの出現率を調整',
  'ENABLED': '有効',
  'DISABLED': '無効',
  'RESET': 'リセット',
  'Registered Agents': '参加プレイヤー',
  'HOST': 'ホスト',
  'YOU': '自分',
  'KICK': '退出させる',
  'READY': '準備完了',
  'WAITING': '待機中',
  'WAITING FOR NODES...': 'プレイヤーを待っています…',
  'READY TO ENGAGE': '準備完了',
  'STAND BY (NOT READY)': '準備する',
  'LAUNCH MATCH': 'マッチ開始',
  'MINIMUM 2 NODES REQUIRED TO INITIATE': '開始には2人以上必要です',
  'WAITING ON NODE SYNCHRONIZATION...': '全員の準備完了を待っています…',
  'LOBBY FULLY LOADED // PERMISSION GRANTED': '開始できます',
  'ESTABLISHING LINK...': '接続中…',
  'RECONNECTED': '再接続しました',
  'CONNECTION TERMINATED': '接続が切断されました',
  'LINK DISCONNECTED': '接続が切断されました',
  'LINK INTERRUPTED': '接続が中断されました',
  'Server is offline. Waking up server, please refresh after 1 min.': 'サーバーを起動しています。1分後に再読み込みしてください。',
  'System Link: Established': 'サーバー接続済み',
  'Players': 'プレイヤー',
  'Rounds': 'ラウンド',
  'LIVE': '実弾',
  'BLANK': '空包',
  'Live Shells': '実弾',
  'Blanks': '空包',
  'YOUR MOVE': 'あなたのターン',
  "OPPONENT'S MOVE": '相手のターン',
  'SELECT TARGET': '対象を選択',
  'SHOOT OPPONENT': '相手を撃つ',
  'SHOOT SELF': '自分を撃つ',
  'GRAB': '取る',
  'USE': '使う',
  'WAIT': '待機',
  'DROP GUN FIRST': '先に銃を置いてください',
  'NO ITEMS': 'アイテムなし',
  'No Items': 'アイテムなし',
  'Incoming Shipment Verified': '補給物資が届きました',
  'CHAMBER_SYNCHRONIZED': '薬室を同期しました',
  'GAME OVER': 'ゲーム終了',
  'VICTORY': '勝利',
  'DEFEAT': '敗北',
  'WIN': '勝利',
  'LOSS': '敗北',
  'WINS': '勝利数',
  'LOSSES': '敗北数',
  'PLAY AGAIN': 'もう一度プレイ',
  'RETURN TO MENU': 'メニューに戻る',
  'MULTIPLAYER SUMMARY': 'マルチプレイ結果',
  'PERFORMANCE REPORT': '戦績レポート',
  'Score': 'スコア',
  'Accuracy': '命中率',
  'Damage Dealt': '与えたダメージ',
  'DMG DEALT': '与ダメージ',
  'DMG TAKEN': '被ダメージ',
  'Items Used': '使用アイテム数',
  'SELF SHOTS': '自分への射撃数',
  'RDS SURVIVED': '生存ラウンド数',
  'Duration': 'プレイ時間',
  'Career matches now display accurate historical local dates.': '戦績履歴の日付表示を改善しました。',
  'CAREER LOG': '戦績',
  'Permanent Service Record': '通算記録',
  'Recent Operations': '最近の対戦',
  'No operational history found in databanks.': '対戦履歴はまだありません。',
  'Global Leaderboard Matrix': 'グローバルランキング',
  'Fetching latest stats from BugshotServer...': '最新の戦績を取得中…',
  'SYNCING STATS': '戦績を同期中',
  'REMOTE STATS ERROR': '戦績の取得に失敗しました',
  'Rank': '順位',
  'Win Ratio': '勝率',
  'Best': '最高',
  'Current': '現在',
  'Tactical Performance Data': 'プレイ統計',
  'Combat Analysis': '戦闘分析',
  'Combat Rating': '総合評価',
  'Total Rating Score:': '総合スコア：',
  'Item Type': 'アイテム',
  'Description': '説明',
  'Magnifying Glass (Reveal)': '虫眼鏡（弾を確認）',
  'Beer (Rack Shell)': 'ビール（弾を排出）',
  'Cigarettes (Heal)': 'タバコ（HP回復）',
  'Handcuffs (Skip Turn)': '手錠（相手のターンを飛ばす）',
  'Hand Saw (2x DMG)': 'ノコギリ（ダメージ2倍）',
  'Burner Phone (Future peek)': '携帯電話（先の弾を確認）',
  'Polarity Inverter (Swap)': 'インバーター（弾を反転）',
  'Adrenaline (Steal)': 'アドレナリン（奪って使用）',
  'Choke Mod (Double shot)': 'チョーク（2発同時発射）',
  'Big Inverter (All invert)': '大型インバーター（全弾反転）',
  'Blood Contract (Loot)': '血の契約（HPと引き換えに補給）',
  'Lucky Charm (Luck boost)': '幸運のお守り（補給運アップ）',
  'Flashbang (Blind opponent)': '閃光弾（相手のアイテム使用を妨害）',
  'Item Crusher (Destroy)': 'クラッシャー（アイテム破壊）',
  'Totem of Undying (Passive)': '不死のトーテム（自動発動）',
  'Mirror (Duplicate Turn)': '鏡（相手のアイテムを再現）',
  'Tarot Deck Card': 'タロットカード',
  'Jackpot Slot Machine': 'ジャックポットマシン',
  'System Announcement': 'システムからのお知らせ',
  'Awaiting Protocol Acknowledgement': '確認してください',
  'DISMISS': '閉じる',
  'Acknowledgements & Asset Credits': '謝辞・素材クレジット',
  'Creator & Developer': '制作者・開発者',
  'Original Creator': '原作制作者',
  'Audio Credits': '音声クレジット',
  'Thank you to the original creators and contributors.': '原作者と貢献者のみなさんに感謝します。',
  'ORIENTATION ERROR': '画面の向きを変更してください',
  'ROTATE': '回転',
  'PERFORMANCE WARNING': 'パフォーマンス警告',
  'Graphics Profile': 'グラフィック設定',
  'Ultra Performance mode profile (no shadows, flat UI, 60FPS).': '超軽量設定にすると影などを無効化し、動作を改善できます。',
  'ENTER CODENAME': 'コードネームを入力',
  'ENTER PASSWORD': 'パスワードを入力',
  'ENTER ROOM CODE': 'ルームコードを入力',
  'TYPE A MESSAGE...': 'メッセージを入力…',
  'Username already exists': 'そのユーザー名はすでに使われています',
  'Username not found': 'ユーザーが見つかりません',
  'Invalid password': 'パスワードが違います',
  'Username and password required': 'ユーザー名とパスワードを入力してください',
  'Registration failed': 'アカウントを作成できませんでした',
  'Login failed': 'ログインできませんでした',
  'Database request failed': 'データベースへの接続に失敗しました'
};

Object.assign(japanese, japaneseExtended);

const patterns: Array<[RegExp, (...values: string[]) => string]> = [
  [/^WAKING UP SERVER\.\.\. \(ATTEMPT (\d+)\/(\d+)\)$/i, (attempt, max) => `サーバーを起動中…（${attempt}/${max}回目）`],
  [/^(\d+) PLAYERS? ONLINE$/i, (count) => `${count}人がオンライン`],
  [/^ROOM CODE: (.+)$/i, (code) => `ルームコード：${code}`],
  [/^ROUND (\d+)$/i, (round) => `ラウンド ${round}`],
  [/^STAGE (\d+)$/i, (stage) => `ステージ ${stage}`],
  [/^ID: (.+)$/i, (id) => `ID：${id}`],
  [/^(.+) JOINED THE LOBBY$/i, (name) => `${name}がロビーに参加しました`],
  [/^(.+) LEFT THE LOBBY$/i, (name) => `${name}がロビーから退出しました`]
];

patterns.push(...japanesePatterns);

let preference: LanguagePreference = 'auto';
let observer: MutationObserver | null = null;
let scheduled = false;
const originals = new WeakMap<Text, { source: string; translated: string }>();
const attributeOriginals = new WeakMap<Element, Map<string, string>>();

function readPreference(): LanguagePreference {
  try {
    const value = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')?.language;
    return value === 'en' || value === 'ja' || value === 'auto' ? value : 'auto';
  } catch {
    return 'auto';
  }
}

export function resolveLanguage(value: LanguagePreference = preference): ResolvedLanguage {
  if (value === 'en' || value === 'ja') return value;
  return navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

export function translateText(source: string, language: ResolvedLanguage = resolveLanguage()): string {
  if (language === 'en') return source;
  const leading = source.match(/^\s*/)?.[0] || '';
  const trailing = source.match(/\s*$/)?.[0] || '';
  const clean = source.trim();
  if (!clean) return source;
  const exact = japanese[clean];
  if (exact) return `${leading}${exact}${trailing}`;
  for (const [pattern, render] of patterns) {
    const match = clean.match(pattern);
    if (match) return `${leading}${render(...match.slice(1))}${trailing}`;
  }
  return source;
}

function localizeText(node: Text, language: ResolvedLanguage) {
  const current = node.nodeValue || '';
  const saved = originals.get(node);
  if (language === 'en') {
    if (saved && current === saved.translated) node.nodeValue = saved.source;
    return;
  }

  let source = current;
  if (saved) {
    source = current === saved.translated ? saved.source : current;
  }
  const translated = translateText(source, language);
  if (translated !== source) {
    originals.set(node, { source, translated });
    if (current !== translated) node.nodeValue = translated;
  }
}

function localizeAttributes(element: Element, language: ResolvedLanguage) {
  const names = ['placeholder', 'title', 'aria-label', 'alt'];
  let saved = attributeOriginals.get(element);
  for (const name of names) {
    const current = element.getAttribute(name);
    if (!current) continue;
    if (language === 'en') {
      const source = saved?.get(name);
      if (source) element.setAttribute(name, source);
      continue;
    }
    if (!saved) {
      saved = new Map<string, string>();
      attributeOriginals.set(element, saved);
    }
    const source = saved.get(name) || current;
    saved.set(name, source);
    const translated = translateText(source, language);
    if (translated !== current) element.setAttribute(name, translated);
  }
}

function localizeTree(root: Node) {
  const language = resolveLanguage();
  if (root.nodeType === Node.TEXT_NODE) localizeText(root as Text, language);
  if (root.nodeType === Node.ELEMENT_NODE) localizeAttributes(root as Element, language);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) localizeText(node as Text, language);
    else localizeAttributes(node as Element, language);
  }
}

function refresh() {
  scheduled = false;
  const language = resolveLanguage();
  const metadata = metadataByLanguage[language];
  document.documentElement.lang = language;
  document.title = metadata.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', metadata.description);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', metadata.socialTitle);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', metadata.socialDescription);
  document.querySelector<HTMLMetaElement>('meta[property="og:locale"]')?.setAttribute('content', metadata.locale);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', metadata.socialTitle);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', metadata.socialDescription);
  localizeTree(document.body);
}

function scheduleRefresh() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(refresh);
}

export function setLanguagePreference(value: LanguagePreference) {
  preference = value;
  scheduleRefresh();
}

export function initializeI18n() {
  preference = readPreference();
  scheduleRefresh();
  if (!observer) {
    observer = new MutationObserver(scheduleRefresh);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label', 'alt']
    });
  }
  const handleLanguageChange = () => preference === 'auto' && scheduleRefresh();
  window.addEventListener('languagechange', handleLanguageChange);
  return () => window.removeEventListener('languagechange', handleLanguageChange);
}
