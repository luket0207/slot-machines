export const chooseWinningRank = (reelItems) => {
  const totalWinRate = reelItems.reduce((sum, item) => sum + item.winRate, 0);
  const loseRate = Math.max(0, 100 - totalWinRate);
  const roll = Math.random() * 100;

  let cursor = 0;
  for (let i = 0; i < reelItems.length; i++) {
    cursor += reelItems[i].winRate;
    if (roll <= cursor) {
      return reelItems[i].rank;
    }
  }

  if (roll <= cursor + loseRate) return null;
  return null;
};

const randomInt = (max) => Math.floor(Math.random() * max);

export const chooseNonMatchingStopItems = (reels) => {
  const stopItemIds = reels.map((reel) => reel.strip[randomInt(reel.strip.length)]);

  while (stopItemIds[0] === stopItemIds[1] && stopItemIds[1] === stopItemIds[2]) {
    stopItemIds[2] = reels[2].strip[randomInt(reels[2].strip.length)];
  }

  return stopItemIds;
};

export const getPayout = ({ matchedItem, stake }) => {
  if (!matchedItem) return 0;
  return stake * matchedItem.multiplier;
};
