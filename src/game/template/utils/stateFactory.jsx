import {
  BONUS_POSITIONS_PER_REEL,
  INITIAL_MONEY,
  REELS_COUNT,
  STAKE_OPTIONS,
  normalizeTheme,
} from "./slotConfig";
import { createReels } from "./reelUtils";

export const createInitialSlotMachineState = (themeConfig = {}) => {
  const theme = normalizeTheme(themeConfig);

  return {
    screen: "start",
    money: INITIAL_MONEY,
    stakeOptions: STAKE_OPTIONS,
    stake: STAKE_OPTIONS[0],
    theme,
    reels: createReels({
      reelItems: theme.reelItems,
      reelsCount: REELS_COUNT,
      bonusPerReel: BONUS_POSITIONS_PER_REEL,
    }),
    isSpinning: false,
    spinCount: 0,
    bonusLadder: 0,
    awaitingHiLoChoice: false,
    nudgesRemaining: 0,
    holdTokens: [],
    heldReels: [false, false, false],
    backboardSpinner: {
      value: 1,
      isSpinning: false,
    },
    lastSpin: {
      lineWin: false,
      payout: 0,
      matchedRank: null,
      bonusItemsSeen: 0,
      bonusLadderAfterSpin: 0,
      bonusTriggered: false,
      hiLoRequired: false,
      hiLoChoice: null,
      hiLoWin: null,
      holdsAwarded: 0,
      nudgesAwarded: 0,
    },
  };
};
