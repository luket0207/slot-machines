import {
  faArrowsUpDown,
  faDice,
  faDoorOpen,
  faFlagCheckered,
  faForward,
  faHandHoldingDollar,
  faMoneyBillWave,
  faRotateLeft,
  faTrophy,
  faCoins,
} from "@fortawesome/free-solid-svg-icons";

const EFFECT_ICONS = {
  start: faFlagCheckered,
  jump: faForward,
  hilo: faArrowsUpDown,
  cashout_offer: faMoneyBillWave,
  insta_win: faCoins,
  pay_your_way: faHandHoldingDollar,
  end: faDoorOpen,
  setback: faRotateLeft,
  win_your_roll: faDice,
  jackpot: faTrophy,
};

const SPECIAL_TILES = {
  1: { text: "Start", effect: "start" },
  3: { text: "Jump Forward", effect: "jump", jumpTo: 15 },
  4: { text: "Higher or Lower", effect: "hilo" },
  6: { text: "x5 win", effect: "cashout_offer", multiplier: 5 },
  7: { text: "Insta win x1", effect: "insta_win", multiplier: 1 },
  9: { text: "Pay your way", effect: "pay_your_way" },
  11: { text: "End", effect: "end" },
  12: { text: "Jump Forward", effect: "jump", jumpTo: 21 },
  13: { text: "Setback", effect: "setback" },
  14: { text: "Win your roll", effect: "win_your_roll", rollMultiplier: 1 },
  16: { text: "Insta win x2", effect: "insta_win", multiplier: 2 },
  17: { text: "End", effect: "end" },
  19: { text: "Jump Forward", effect: "jump", jumpTo: 29 },
  20: { text: "x10 win", effect: "cashout_offer", multiplier: 10 },
  22: { text: "End", effect: "end" },
  23: { text: "Pay your way", effect: "pay_your_way" },
  24: { text: "Win your roll x5", effect: "win_your_roll", rollMultiplier: 5 },
  26: { text: "Higher or Lower", effect: "hilo" },
  27: { text: "Insta win x5", effect: "insta_win", multiplier: 5 },
  28: { text: "End", effect: "end" },
  30: { text: "x20 win", effect: "cashout_offer", multiplier: 20 },
  31: { text: "Setback", effect: "setback" },
  32: { text: "Jump Forward", effect: "jump", jumpTo: 38 },
  33: { text: "End", effect: "end" },
  34: { text: "Higher or Lower", effect: "hilo" },
  36: { text: "Insta win x10", effect: "insta_win", multiplier: 10 },
  37: { text: "End", effect: "end" },
  39: { text: "Win your roll x10", effect: "win_your_roll", rollMultiplier: 10 },
  40: { text: "Pay your way", effect: "pay_your_way" },
  41: { text: "End", effect: "end" },
  42: { text: "x50 win", effect: "cashout_offer", multiplier: 50 },
  43: { text: "Setback", effect: "setback" },
  44: { text: "End", effect: "end" },
  45: { text: "Higher or Lower", effect: "hilo" },
  47: { text: "End", effect: "end" },
  48: { text: "x100 win", effect: "cashout_offer", multiplier: 100 },
  49: { text: "End", effect: "end" },
  50: { text: "Jackpot", effect: "jackpot", multiplier: 250 },
};

const buildTiles = () =>
  Array.from({ length: 50 }, (_, index) => {
    const tile = index + 1;
    const special = SPECIAL_TILES[tile] || { text: "", effect: "blank" };

    return {
      tile,
      text: special.text,
      effect: special.effect,
      jumpTo: special.jumpTo || null,
      multiplier: special.multiplier || null,
      rollMultiplier: special.rollMultiplier || null,
      icon: EFFECT_ICONS[special.effect] || null,
    };
  });

export const FONT_AWESOME_BACKBOARD_CONFIG = {
  gridColumns: 10,
  gridRows: 5,
  maxTile: 50,
  overflowTargetTile: 35,
  tiles: buildTiles(),
};

export const getBackboardTileByIndex = (tileIndex) =>
  FONT_AWESOME_BACKBOARD_CONFIG.tiles.find((tile) => tile.tile === tileIndex) || null;
