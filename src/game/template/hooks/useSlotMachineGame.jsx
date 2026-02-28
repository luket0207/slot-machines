import { useCallback, useEffect, useMemo, useRef } from "react";
import { useGame } from "../../../engine/gameContext/gameContext";
import { MODAL_BUTTONS, useModal } from "../../../engine/ui/modal/modalContext";
import { createInitialSlotMachineState } from "../utils/stateFactory";
import { chooseNonMatchingStopItems, chooseWinningRank, getPayout } from "../utils/slotMath";
import { getVisibleBonusCount, getVisibleIndexes, shuffleItems, wrapIndex } from "../utils/reelUtils";
import { useNumberSpinner } from "./useNumberSpinner";

const SPIN_STEP_MS = 85;
const STOP_DELAYS = [900, 1250, 1600];
const MIN_STAKE_TO_PLAY = 1;
const REEL_SHUFFLE_BASE_DELAY = 240;
const REEL_SHUFFLE_STAGGER = 90;
const HOLD_TOKEN_SPINS = 3;
const BONUS_LADDER_MAX = 25;
const FLASH_MODAL_DURATION_SECONDS = 2;

const getMaxStakeForMoney = (money) => {
  if (money < 1) return 0;
  if (money < 3) return 1;
  if (money < 5) return 3;
  if (money < 10) return 5;
  return 10;
};

const getClampedStake = (stake, money) => {
  const maxStake = getMaxStakeForMoney(money);
  if (maxStake === 0) return 1;
  return Math.min(stake, maxStake);
};

const randomStopItemId = (reel) => reel.strip[Math.floor(Math.random() * reel.strip.length)];

const buildWeightedStopItemIds = (slotMachine) => {
  const winningRank = chooseWinningRank(slotMachine.theme.reelItems);
  if (winningRank == null) return chooseNonMatchingStopItems(slotMachine.reels);

  const targetItem = slotMachine.theme.reelItems.find((item) => item.rank === winningRank);
  return slotMachine.reels.map(() => targetItem.id);
};

const buildHeldAwareStopItemIds = (slotMachine, heldReels) => {
  const anyHeld = heldReels.some(Boolean);
  if (!anyHeld) return buildWeightedStopItemIds(slotMachine);

  return slotMachine.reels.map((reel, idx) =>
    heldReels[idx] ? reel.strip[reel.index] : randomStopItemId(reel)
  );
};

const consumeHoldTokens = (tokens, count) => tokens.slice(Math.min(tokens.length, count));

const decayHoldTokens = (tokens) => tokens.map((token) => token - 1).filter((token) => token > 0);

const advanceBonusLadder = (currentValue, increment) => {
  let next = currentValue + increment;
  while (next > BONUS_LADDER_MAX) {
    next -= BONUS_LADDER_MAX;
  }
  return next;
};

const evaluateLineWin = (reels, reelItems, stake) => {
  const centerItemIds = reels.map((reel) => reel.strip[reel.index]);
  const firstItemId = centerItemIds[0];
  const lineWin = centerItemIds.every((id) => id === firstItemId);
  const matchedItem = lineWin ? reelItems.find((item) => item.id === firstItemId) || null : null;

  return {
    lineWin,
    matchedItem,
    payout: getPayout({ matchedItem, stake }),
  };
};

const getVisibleBonusKeySet = (reels) => {
  const keys = new Set();

  reels.forEach((reel) => {
    const visibleIndexes = getVisibleIndexes(reel.index, reel.strip.length);
    visibleIndexes.forEach((idx) => {
      if (reel.bonusPositions.includes(idx)) {
        keys.add(`${reel.id}:${idx}`);
      }
    });
  });

  return keys;
};

const countNewlyVisibleBonusItems = (beforeReels, afterReels) => {
  const before = getVisibleBonusKeySet(beforeReels);
  const after = getVisibleBonusKeySet(afterReels);
  let newlyVisibleCount = 0;

  after.forEach((key) => {
    if (!before.has(key)) newlyVisibleCount += 1;
  });

  return newlyVisibleCount;
};

export const useSlotMachineGame = () => {
  const { gameState, setGameState } = useGame();
  const { openModal, closeModal } = useModal();
  const { spinNumberSpinner } = useNumberSpinner();
  const nudgeInProgressRef = useRef(false);

  const slotMachine = gameState.slotMachine;

  const setScreen = useCallback(
    (screen) => {
      setGameState((prev) => ({
        ...prev,
        slotMachine: {
          ...prev.slotMachine,
          screen,
        },
      }));
    },
    [setGameState]
  );

  const setStake = useCallback(
    (stake) => {
      setGameState((prev) => ({
        ...prev,
        slotMachine: {
          ...prev.slotMachine,
          stake: getClampedStake(stake, prev.slotMachine.money),
        },
      }));
    },
    [setGameState]
  );

  const addDebugMoney = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      slotMachine: {
        ...prev.slotMachine,
        money: prev.slotMachine.money + 10,
      },
    }));
  }, [setGameState]);

  const addDebugHold = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      slotMachine: {
        ...prev.slotMachine,
        holdTokens: [...prev.slotMachine.holdTokens, HOLD_TOKEN_SPINS],
      },
    }));
  }, [setGameState]);

  const addDebugNudges = useCallback(
    (count) => {
      const safeCount = Math.max(0, Number(count) || 0);
      if (safeCount <= 0) return;

      setGameState((prev) => ({
        ...prev,
        slotMachine: {
          ...prev.slotMachine,
          nudgesRemaining: prev.slotMachine.nudgesRemaining + safeCount,
        },
      }));
    },
    [setGameState]
  );

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      slotMachine: {
        ...createInitialSlotMachineState(prev.slotMachine.theme),
        screen: "slots",
      },
    }));
  }, [setGameState]);

  const backToSlots = useCallback(() => {
    setScreen("slots");
  }, [setScreen]);

  const showFlashModal = useCallback(
    (modalContent, duration = FLASH_MODAL_DURATION_SECONDS) => {
      const safeDuration = Math.max(0.1, Number(duration) || FLASH_MODAL_DURATION_SECONDS);
      openModal({
        modalContent,
        flashModal: true,
        duration: safeDuration,
      });

      return new Promise((resolve) => {
        setTimeout(resolve, safeDuration * 1000 + 60);
      });
    },
    [openModal]
  );

  const animateReels = useCallback(
    (stopItemIds, heldReels) =>
      Promise.all(
        slotMachine.reels.map((reel, reelIdx) => {
          if (heldReels[reelIdx]) {
            return Promise.resolve({ ...reel });
          }

          const stopAfter = STOP_DELAYS[reelIdx];

          return new Promise((resolve) => {
            const interval = setInterval(() => {
              setGameState((prev) => {
                const reels = prev.slotMachine.reels.map((nextReel) =>
                  nextReel.id === reel.id
                    ? {
                        ...nextReel,
                        index: (nextReel.index + 1) % nextReel.strip.length,
                      }
                    : nextReel
                );

                return {
                  ...prev,
                  slotMachine: {
                    ...prev.slotMachine,
                    reels,
                  },
                };
              });
            }, SPIN_STEP_MS);

            const shuffleTimeout = setTimeout(() => {
              setGameState((prev) => {
                const reels = prev.slotMachine.reels.map((nextReel) => {
                  if (nextReel.id !== reel.id) return nextReel;

                  const currentCenterItemId = nextReel.strip[nextReel.index];
                  const shuffledStrip = shuffleItems(nextReel.strip);
                  const shuffledCenterIndex = shuffledStrip.findIndex(
                    (itemId) => itemId === currentCenterItemId
                  );

                  return {
                    ...nextReel,
                    strip: shuffledStrip,
                    index: shuffledCenterIndex >= 0 ? shuffledCenterIndex : nextReel.index,
                  };
                });

                return {
                  ...prev,
                  slotMachine: {
                    ...prev.slotMachine,
                    reels,
                  },
                };
              });
            }, REEL_SHUFFLE_BASE_DELAY + reelIdx * REEL_SHUFFLE_STAGGER);

            setTimeout(() => {
              clearInterval(interval);
              clearTimeout(shuffleTimeout);
              setGameState((prev) => {
                const reels = prev.slotMachine.reels.map((nextReel) =>
                  nextReel.id === reel.id
                    ? {
                        ...nextReel,
                        index: Math.max(
                          0,
                          nextReel.strip.findIndex((itemId) => itemId === stopItemIds[reelIdx])
                        ),
                      }
                    : nextReel
                );
                const updatedReel = reels.find((nextReel) => nextReel.id === reel.id);

                resolve(updatedReel);

                return {
                  ...prev,
                  slotMachine: {
                    ...prev.slotMachine,
                    reels,
                  },
                };
              });
            }, stopAfter);
          });
        })
      ),
    [setGameState, slotMachine.reels]
  );

  const resolveLadderRewards = useCallback(
    async (bonusItemsSeen, bonusLadderAfterSpin) => {
      let holdsAwarded = 0;
      let nudgesAwarded = 0;
      let hiLoRequired = false;

      if (bonusItemsSeen <= 0) {
        return { holdsAwarded, nudgesAwarded, hiLoRequired };
      }

      if (bonusLadderAfterSpin === 7 || bonusLadderAfterSpin === 22) {
        await showFlashModal(<p>Bonus ladder reward: +1 hold</p>);
        holdsAwarded += 1;
      }

      if (bonusLadderAfterSpin === 18) {
        await showFlashModal(<p>Bonus ladder reward: nudge spinner</p>);
        const spinnerAward = await spinNumberSpinner({ min: 1, max: 5, durationMs: 900 });
        nudgesAwarded += spinnerAward;
        await showFlashModal(<p>Nudge spinner result: +{spinnerAward} nudges</p>);
      }

      if (bonusLadderAfterSpin === 12 || bonusLadderAfterSpin === 25) {
        await showFlashModal(<p>Bonus ladder check: choose higher or lower</p>);
        hiLoRequired = true;
      }

      return { holdsAwarded, nudgesAwarded, hiLoRequired };
    },
    [showFlashModal, spinNumberSpinner]
  );

  const spin = useCallback(async () => {
    if (slotMachine.screen !== "slots" || slotMachine.isSpinning) return;
    if (slotMachine.awaitingHiLoChoice || slotMachine.nudgesRemaining > 0) return;
    if (slotMachine.money < slotMachine.stake) return;

    const heldReels = [...slotMachine.heldReels];
    const holdsUsedCount = heldReels.filter(Boolean).length;
    const holdTokensAfterSpinStart = decayHoldTokens(
      consumeHoldTokens(slotMachine.holdTokens, holdsUsedCount)
    );
    const stopItemIds = buildHeldAwareStopItemIds(slotMachine, heldReels);
    const stakeAtSpin = slotMachine.stake;
    const bonusLadderBeforeSpin = slotMachine.bonusLadder;

    setGameState((prev) => ({
      ...prev,
      slotMachine: {
        ...prev.slotMachine,
        isSpinning: true,
        money: prev.slotMachine.money - prev.slotMachine.stake,
        holdTokens: holdTokensAfterSpinStart,
        heldReels: [false, false, false],
      },
    }));

    spinNumberSpinner({ min: 1, max: 10 });
    const finalReels = await animateReels(stopItemIds, heldReels);

    const { lineWin, matchedItem, payout } = evaluateLineWin(
      finalReels,
      slotMachine.theme.reelItems,
      stakeAtSpin
    );

    if (lineWin && payout > 0 && matchedItem) {
      await showFlashModal(
        <div className="modalFlashWin">
          <p className="modalFlashWin__text">
            Win: {matchedItem.label} (reel item {matchedItem.rank})
          </p>
          <p className="modalFlashWin__amount">
            {"\u00A3"}
            {payout.toFixed(2)}
          </p>
        </div>,
        3
      );
    }

    const bonusItemsSeen = finalReels.reduce((count, reel) => count + getVisibleBonusCount(reel), 0);
    const bonusLadderAfterSpin = advanceBonusLadder(bonusLadderBeforeSpin, bonusItemsSeen);
    const { holdsAwarded, nudgesAwarded, hiLoRequired } = await resolveLadderRewards(
      bonusItemsSeen,
      bonusLadderAfterSpin
    );

    setGameState((prev) => {
      const active = prev.slotMachine;
      const nextMoney = active.money + payout;
      const nextStake = getClampedStake(active.stake, nextMoney);

      return {
        ...prev,
        slotMachine: {
          ...active,
          reels: finalReels,
          isSpinning: false,
          money: nextMoney,
          stake: nextStake,
          spinCount: active.spinCount + 1,
          bonusLadder: bonusLadderAfterSpin,
          nudgesRemaining: active.nudgesRemaining + nudgesAwarded,
          holdTokens: [...active.holdTokens, ...Array.from({ length: holdsAwarded }, () => HOLD_TOKEN_SPINS)],
          awaitingHiLoChoice: hiLoRequired,
          screen: "slots",
          lastSpin: {
            lineWin,
            payout,
            matchedRank: matchedItem?.rank || null,
            bonusItemsSeen,
            bonusLadderAfterSpin,
            bonusTriggered: false,
            hiLoRequired,
            hiLoChoice: null,
            hiLoWin: null,
            holdsAwarded,
            nudgesAwarded,
          },
        },
      };
    });
  }, [animateReels, resolveLadderRewards, setGameState, showFlashModal, slotMachine, spinNumberSpinner]);

  const nudgeReel = useCallback(
    async (reelId, direction) => {
      if (nudgeInProgressRef.current) return;
      if (slotMachine.screen !== "slots" || slotMachine.isSpinning) return;
      if (slotMachine.nudgesRemaining <= 0) return;
      if (slotMachine.heldReels[reelId]) return;
      nudgeInProgressRef.current = true;

      const delta = direction === "up" ? 1 : -1;
      const nextReels = slotMachine.reels.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              // Nudge only moves the reel pointer; strip order is preserved.
              index: wrapIndex(reel.index + delta, reel.strip.length),
            }
          : reel
      );

      const { lineWin, matchedItem, payout } = evaluateLineWin(
        nextReels,
        slotMachine.theme.reelItems,
        slotMachine.stake
      );
      const bonusItemsSeen = countNewlyVisibleBonusItems(slotMachine.reels, nextReels);
      const bonusLadderAfterSpin = advanceBonusLadder(slotMachine.bonusLadder, bonusItemsSeen);
      const holdTokensAfterNudge = decayHoldTokens(slotMachine.holdTokens);
      const heldReelsAfterNudge =
        slotMachine.heldReels.filter(Boolean).length > holdTokensAfterNudge.length
          ? [false, false, false]
          : slotMachine.heldReels;

      const nudgeSnapshot = {
        nextReels,
        lineWin,
        matchedItem,
        payout,
        bonusItemsSeen,
        bonusLadderAfterSpin,
        heldReelsAfterNudge,
        holdTokensAfterNudge,
      };

      if (nudgeSnapshot.lineWin && nudgeSnapshot.payout > 0 && nudgeSnapshot.matchedItem) {
        await showFlashModal(
          <div className="modalFlashWin">
            <p className="modalFlashWin__text">
              Win: {nudgeSnapshot.matchedItem.label} (reel item {nudgeSnapshot.matchedItem.rank})
            </p>
            <p className="modalFlashWin__amount">
              {"\u00A3"}
              {nudgeSnapshot.payout.toFixed(2)}
            </p>
          </div>,
          3
        );
      }

      setGameState((prev) => {
        const active = prev.slotMachine;
        if (active.screen !== "slots" || active.isSpinning) return prev;
        if (active.nudgesRemaining <= 0) return prev;
        if (active.heldReels[reelId]) return prev;

        return {
          ...prev,
          slotMachine: {
            ...active,
            reels: nudgeSnapshot.nextReels,
            nudgesRemaining: Math.max(0, active.nudgesRemaining - 1),
            holdTokens: nudgeSnapshot.holdTokensAfterNudge,
            heldReels: nudgeSnapshot.heldReelsAfterNudge,
          },
        };
      });

      try {
        const { holdsAwarded, nudgesAwarded, hiLoRequired } = await resolveLadderRewards(
          nudgeSnapshot.bonusItemsSeen,
          nudgeSnapshot.bonusLadderAfterSpin
        );

        setGameState((prev) => {
          const active = prev.slotMachine;
          const nextMoney = active.money + nudgeSnapshot.payout;
          const nextStake = getClampedStake(active.stake, nextMoney);
          const nextNudges = nudgeSnapshot.lineWin
            ? nudgesAwarded
            : active.nudgesRemaining + nudgesAwarded;

          return {
            ...prev,
            slotMachine: {
              ...active,
              reels: nudgeSnapshot.nextReels,
              money: nextMoney,
              stake: nextStake,
              spinCount: active.spinCount + 1,
              bonusLadder: nudgeSnapshot.bonusLadderAfterSpin,
              nudgesRemaining: nextNudges,
              holdTokens: [...active.holdTokens, ...Array.from({ length: holdsAwarded }, () => HOLD_TOKEN_SPINS)],
              heldReels: nudgeSnapshot.heldReelsAfterNudge,
              awaitingHiLoChoice: active.awaitingHiLoChoice || hiLoRequired,
              screen: "slots",
              lastSpin: {
                lineWin: nudgeSnapshot.lineWin,
                payout: nudgeSnapshot.payout,
                matchedRank: nudgeSnapshot.matchedItem?.rank || null,
                bonusItemsSeen: nudgeSnapshot.bonusItemsSeen,
                bonusLadderAfterSpin: nudgeSnapshot.bonusLadderAfterSpin,
                bonusTriggered: false,
                hiLoRequired: active.awaitingHiLoChoice || hiLoRequired,
                hiLoChoice: null,
                hiLoWin: null,
                holdsAwarded,
                nudgesAwarded,
              },
            },
          };
        });
      } finally {
        nudgeInProgressRef.current = false;
      }
    },
    [resolveLadderRewards, setGameState, showFlashModal, slotMachine]
  );

  const toggleHold = useCallback(
    (reelId) => {
      setGameState((prev) => {
        const active = prev.slotMachine;
        if (active.screen !== "slots" || active.isSpinning) return prev;
        if (active.awaitingHiLoChoice && active.nudgesRemaining <= 0) return prev;

        const isHeld = active.heldReels[reelId];
        const heldCount = active.heldReels.filter(Boolean).length;
        const holdsAvailable = active.holdTokens.length;

        if (!isHeld && heldCount >= holdsAvailable) return prev;
        if (!isHeld && active.nudgesRemaining > 0 && heldCount >= 2) return prev;

        const heldReels = [...active.heldReels];
        heldReels[reelId] = !heldReels[reelId];

        return {
          ...prev,
          slotMachine: {
            ...active,
            heldReels,
          },
        };
      });
    },
    [setGameState]
  );

  const handleHiLoChoice = useCallback(
    async (choice) => {
      if (!slotMachine.awaitingHiLoChoice) return;
      if (slotMachine.nudgesRemaining > 0) return;
      if (slotMachine.screen !== "slots") return;
      if (slotMachine.backboardSpinner.isSpinning || slotMachine.isSpinning) return;

      const previousValue = slotMachine.backboardSpinner.value;
      const nextValue = await spinNumberSpinner({ min: 1, max: 10 });
      const hiLoWin =
        choice === "higher"
          ? nextValue > previousValue
          : choice === "lower"
            ? nextValue < previousValue
            : false;

      setGameState((prev) => ({
        ...prev,
        slotMachine: {
          ...prev.slotMachine,
          awaitingHiLoChoice: false,
          screen: hiLoWin ? "backboard" : "slots",
          lastSpin: {
            ...prev.slotMachine.lastSpin,
            bonusTriggered: hiLoWin,
            hiLoRequired: true,
            hiLoChoice: choice,
            hiLoWin,
          },
        },
      }));
    },
    [
      setGameState,
      slotMachine.awaitingHiLoChoice,
      slotMachine.nudgesRemaining,
      slotMachine.screen,
      slotMachine.backboardSpinner.isSpinning,
      slotMachine.backboardSpinner.value,
      slotMachine.isSpinning,
      spinNumberSpinner,
    ]
  );

  useEffect(() => {
    if (slotMachine.money >= MIN_STAKE_TO_PLAY) return;
    if (slotMachine.screen === "start") return;

    openModal({
      modalTitle: "You Lost",
      modalContent: <p>You are out of money. Returning to the start screen.</p>,
      buttons: MODAL_BUTTONS.OK,
      onClick: () => {
        closeModal();
        setGameState((prev) => ({
          ...prev,
          slotMachine: {
            ...createInitialSlotMachineState(prev.slotMachine.theme),
            screen: "start",
          },
        }));
      },
    });
  }, [closeModal, openModal, setGameState, slotMachine.money, slotMachine.screen, slotMachine.theme]);

  const canSpin = useMemo(
    () =>
      slotMachine.screen === "slots" &&
      !slotMachine.isSpinning &&
      !slotMachine.awaitingHiLoChoice &&
      slotMachine.nudgesRemaining <= 0 &&
      slotMachine.money >= slotMachine.stake,
    [
      slotMachine.awaitingHiLoChoice,
      slotMachine.isSpinning,
      slotMachine.money,
      slotMachine.nudgesRemaining,
      slotMachine.screen,
      slotMachine.stake,
    ]
  );

  const canChooseHiLo = useMemo(
    () =>
      slotMachine.screen === "slots" &&
      slotMachine.awaitingHiLoChoice &&
      slotMachine.nudgesRemaining <= 0 &&
      !slotMachine.backboardSpinner.isSpinning &&
      !slotMachine.isSpinning,
    [
      slotMachine.awaitingHiLoChoice,
      slotMachine.backboardSpinner.isSpinning,
      slotMachine.isSpinning,
      slotMachine.nudgesRemaining,
      slotMachine.screen,
    ]
  );

  return {
    slotMachine,
    startGame,
    setStake,
    addDebugMoney,
    addDebugHold,
    addDebugNudges,
    spin,
    nudgeReel,
    toggleHold,
    canSpin,
    backToSlots,
    canChooseHiLo,
    handleHiLoChoice,
  };
};
