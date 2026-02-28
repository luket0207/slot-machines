const randomInt = (max) => Math.floor(Math.random() * max);

export const shuffleItems = (items) => {
  const arr = [...items];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
};

export const createRandomBonusPositions = (stripLength, count) => {
  const picks = new Set();

  while (picks.size < count) {
    picks.add(randomInt(stripLength));
  }

  return Array.from(picks).sort((a, b) => a - b);
};

export const createReels = ({ reelItems, reelsCount, bonusPerReel }) => {
  const baseStrip = reelItems.map((item) => item.id);
  const stripLength = baseStrip.length;

  return Array.from({ length: reelsCount }, (_, idx) => ({
    id: idx,
    strip: shuffleItems(baseStrip),
    index: randomInt(stripLength),
    bonusPositions: createRandomBonusPositions(stripLength, bonusPerReel),
  }));
};

export const wrapIndex = (index, size) => {
  if (size <= 0) return 0;
  return (index + size) % size;
};

export const getVisibleIndexes = (centerIndex, stripLength) => [
  wrapIndex(centerIndex - 1, stripLength),
  wrapIndex(centerIndex, stripLength),
  wrapIndex(centerIndex + 1, stripLength),
];

export const isBonusVisible = (reel) => {
  const visible = getVisibleIndexes(reel.index, reel.strip.length);
  return visible.some((pos) => reel.bonusPositions.includes(pos));
};

export const getVisibleBonusCount = (reel) => {
  const visible = getVisibleIndexes(reel.index, reel.strip.length);
  return visible.reduce((count, pos) => count + (reel.bonusPositions.includes(pos) ? 1 : 0), 0);
};
