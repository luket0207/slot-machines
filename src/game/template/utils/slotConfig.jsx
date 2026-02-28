export const DEFAULT_REEL_ITEMS = [
  { id: "reelItem1", rank: 1, label: "1", winRate: 10, multiplier: 1 },
  { id: "reelItem2", rank: 2, label: "2", winRate: 8, multiplier: 2 },
  { id: "reelItem3", rank: 3, label: "3", winRate: 5, multiplier: 3 },
  { id: "reelItem4", rank: 4, label: "4", winRate: 4, multiplier: 4 },
  { id: "reelItem5", rank: 5, label: "5", winRate: 3, multiplier: 5 },
  { id: "reelItem6", rank: 6, label: "6", winRate: 2, multiplier: 10 },
  { id: "reelItem7", rank: 7, label: "7", winRate: 1, multiplier: 15 },
  { id: "reelItem8", rank: 8, label: "8", winRate: 0.5, multiplier: 25 },
  { id: "reelItem9", rank: 9, label: "9", winRate: 0.1, multiplier: 50 },
  { id: "reelItem10", rank: 10, label: "10", winRate: 0.01, multiplier: 100 },
];

export const DEFAULT_BONUS_ITEM = {
  id: "bonusItem",
  label: "BONUS",
};

export const STAKE_OPTIONS = [1, 3, 5, 10];
export const INITIAL_MONEY = 20;
export const REELS_COUNT = 3;
export const BONUS_POSITIONS_PER_REEL = 3;

export const normalizeTheme = (themeConfig = {}) => {
  const themeItems = Array.isArray(themeConfig.reelItems) ? themeConfig.reelItems : null;
  const reelItems = (themeItems || DEFAULT_REEL_ITEMS).slice(0, 10).map((item, idx) => ({
    id: item.id || `reelItem${idx + 1}`,
    rank: item.rank || idx + 1,
    label: item.label || `${idx + 1}`,
    winRate: typeof item.winRate === "number" ? item.winRate : DEFAULT_REEL_ITEMS[idx].winRate,
    multiplier:
      typeof item.multiplier === "number" ? item.multiplier : DEFAULT_REEL_ITEMS[idx].multiplier,
  }));

  return {
    name: themeConfig.name || "Template Slot Machine",
    reelItems,
    bonusItem: themeConfig.bonusItem || DEFAULT_BONUS_ITEM,
  };
};
