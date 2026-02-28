import { DEFAULT_THEME } from "../../themes";

export const DEFAULT_REEL_ITEMS = [
  { id: "reelItem1", rank: 1, name: "1", label: "1", winRate: 10, multiplier: 1 },
  { id: "reelItem2", rank: 2, name: "2", label: "2", winRate: 8, multiplier: 2 },
  { id: "reelItem3", rank: 3, name: "3", label: "3", winRate: 5, multiplier: 3 },
  { id: "reelItem4", rank: 4, name: "4", label: "4", winRate: 4, multiplier: 4 },
  { id: "reelItem5", rank: 5, name: "5", label: "5", winRate: 3, multiplier: 5 },
  { id: "reelItem6", rank: 6, name: "6", label: "6", winRate: 2, multiplier: 10 },
  { id: "reelItem7", rank: 7, name: "7", label: "7", winRate: 1, multiplier: 15 },
  { id: "reelItem8", rank: 8, name: "8", label: "8", winRate: 0.5, multiplier: 25 },
  { id: "reelItem9", rank: 9, name: "9", label: "9", winRate: 0.1, multiplier: 50 },
  { id: "reelItem10", rank: 10, name: "10", label: "10", winRate: 0.01, multiplier: 100 },
];

export const DEFAULT_BONUS_ITEM = {
  id: "bonusItem",
  name: "Bonus",
  label: "BONUS",
};

export const STAKE_OPTIONS = [1, 3, 5, 10];
export const INITIAL_MONEY = 20;
export const REELS_COUNT = 3;
export const BONUS_POSITIONS_PER_REEL = 3;

export const DEFAULT_COLOUR_SCHEME = {
  primaryBackground: "#1b2d2f",
  textOnePrimaryBackground: "#e9f6f3",
  secondaryBackground: "#223c3d",
  textOneSecondaryBackground: "#def1eb",
  primary: "#1ea89d",
  textOnPrimary: "#03201d",
  secondary: "#3fb37b",
  textOnSecondary: "#082315",
  tertiary: "#cae37a",
  textOnTertiary: "#1f2a0f",
  nudgeColour: "#3f98ff",
  holdColour: "#f04444",
  backboardColour: "#f1c65b",
};

export const DEFAULT_THEME_BACKGROUND =
  "radial-gradient(circle at top, rgba(255, 212, 84, 0.18), transparent 45%), linear-gradient(180deg, #1f2a2f, #14181b)";

const normalizeReelItem = (item, idx) => ({
  id: item.id || `reelItem${idx + 1}`,
  rank: item.rank || idx + 1,
  name: item.name || item.label || `${idx + 1}`,
  label: item.label || item.name || `${idx + 1}`,
  image: item.image || null,
  icon: item.icon || null,
  iconColor: item.iconColor || null,
  winRate: typeof item.winRate === "number" ? item.winRate : DEFAULT_REEL_ITEMS[idx].winRate,
  multiplier: typeof item.multiplier === "number" ? item.multiplier : DEFAULT_REEL_ITEMS[idx].multiplier,
});

export const normalizeTheme = (themeConfig = {}) => {
  const mergedTheme = { ...DEFAULT_THEME, ...themeConfig };
  const themeItems = Array.isArray(mergedTheme.reelItemArray)
    ? mergedTheme.reelItemArray
    : Array.isArray(mergedTheme.reelItems)
      ? mergedTheme.reelItems
      : null;
  const reelItems = (themeItems || DEFAULT_REEL_ITEMS).slice(0, 10).map(normalizeReelItem);
  const colorInput = mergedTheme.colourScheme || mergedTheme.colorScheme || {};
  const colourScheme = {
    ...DEFAULT_COLOUR_SCHEME,
    ...colorInput,
  };
  const bonusInput = mergedTheme.bonusItem || DEFAULT_BONUS_ITEM;

  return {
    id: mergedTheme.id || "template-slot-machine",
    name: mergedTheme.name || "Template Slot Machine",
    reelItemArray: reelItems,
    reelItems,
    bonusItem: {
      id: bonusInput.id || DEFAULT_BONUS_ITEM.id,
      name: bonusInput.name || bonusInput.label || DEFAULT_BONUS_ITEM.name,
      label: bonusInput.label || bonusInput.name || DEFAULT_BONUS_ITEM.label,
      image: bonusInput.image || null,
      icon: bonusInput.icon || null,
      iconColor: bonusInput.iconColor || null,
    },
    colorScheme: colourScheme,
    colourScheme,
    background: mergedTheme.background || DEFAULT_THEME_BACKGROUND,
    backboardComponent: mergedTheme.backboardComponent || null,
  };
};

export const buildThemeStyleVars = (theme) => ({
  "--primaryBackground": theme?.colourScheme?.primaryBackground || DEFAULT_COLOUR_SCHEME.primaryBackground,
  "--textOnePrimaryBackground":
    theme?.colourScheme?.textOnePrimaryBackground || DEFAULT_COLOUR_SCHEME.textOnePrimaryBackground,
  "--secondaryBackground": theme?.colourScheme?.secondaryBackground || DEFAULT_COLOUR_SCHEME.secondaryBackground,
  "--textOneSecondaryBackground":
    theme?.colourScheme?.textOneSecondaryBackground || DEFAULT_COLOUR_SCHEME.textOneSecondaryBackground,
  "--primary": theme?.colourScheme?.primary || DEFAULT_COLOUR_SCHEME.primary,
  "--textOnPrimary": theme?.colourScheme?.textOnPrimary || DEFAULT_COLOUR_SCHEME.textOnPrimary,
  "--secondary": theme?.colourScheme?.secondary || DEFAULT_COLOUR_SCHEME.secondary,
  "--textOnSecondary": theme?.colourScheme?.textOnSecondary || DEFAULT_COLOUR_SCHEME.textOnSecondary,
  "--tertiary": theme?.colourScheme?.tertiary || DEFAULT_COLOUR_SCHEME.tertiary,
  "--textOnTertiary": theme?.colourScheme?.textOnTertiary || DEFAULT_COLOUR_SCHEME.textOnTertiary,
  "--nudgeColour": theme?.colourScheme?.nudgeColour || DEFAULT_COLOUR_SCHEME.nudgeColour,
  "--holdColour": theme?.colourScheme?.holdColour || DEFAULT_COLOUR_SCHEME.holdColour,
  "--backboardColour": theme?.colourScheme?.backboardColour || DEFAULT_COLOUR_SCHEME.backboardColour,
  "--themeBackground": theme?.background || DEFAULT_THEME_BACKGROUND,
});
