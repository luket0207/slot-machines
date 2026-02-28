import { useCallback, useEffect, useMemo, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useGame } from "../../../engine/gameContext/gameContext";
import { MODAL_BUTTONS, useModal } from "../../../engine/ui/modal/modalContext";
import { createInitialBackboardTrailState, createInitialSlotMachineState } from "../utils/stateFactory";
import { chooseNonMatchingStopItems, chooseWinningRank, getPayout } from "../utils/slotMath";
import { getVisibleBonusCount, getVisibleIndexes, shuffleItems, wrapIndex } from "../utils/reelUtils";
import { useNumberSpinner } from "./useNumberSpinner";

const SPIN_STEP_MS = 55;
const STOP_DELAYS = [900, 1250, 1600];
const MIN_STAKE_TO_PLAY = 1;
const REEL_SHUFFLE_BASE_DELAY = 240;
const REEL_SHUFFLE_STAGGER = 90;
const HOLD_TOKEN_SPINS = 3;
const BONUS_LADDER_MAX = 25;
const FLASH_MODAL_DURATION_SECONDS = 2;
const WIN_FLASH_DELAY_MS = 2000;
const BACKBOARD_SPINNER_DURATION_MS = 900;

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

const getBackboardTile = (theme, tileNumber) =>
  theme?.backboardConfig?.tiles?.find((tile) => tile.tile === tileNumber) || null;

const enterBackboardTrailState = (theme) => ({
  ...createInitialBackboardTrailState(theme),
  status: "awaiting_roll",
});

export const useSlotMachineGame = () => {
  const { gameState, setGameState } = useGame();
  const { openModal, closeModal } = useModal();
  const { spinNumberSpinner } = useNumberSpinner();
  const nudgeInProgressRef = useRef(false);
  const backboardActionInProgressRef = useRef(false);

  const slotMachine = gameState.slotMachine;

  const setStake = useCallback(
    (stake) => {
      if (slotMachine.winFlashActive) return;
      setGameState((prev) => ({
        ...prev,
        slotMachine: {
          ...prev.slotMachine,
          stake: getClampedStake(stake, prev.slotMachine.money),
        },
      }));
    },
    [setGameState, slotMachine.winFlashActive]
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

  const returnToSlotsFromBackboard = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      slotMachine: {
        ...prev.slotMachine,
        screen: "slots",
        awaitingHiLoChoice: false,
        hiLoContext: null,
        backboardTrail: createInitialBackboardTrailState(prev.slotMachine.theme),
      },
    }));
  }, [setGameState]);

  const renderWinVisual = useCallback((item) => {
    if (item?.image) {
      return <img className="modalFlashWin__visualImage" src={item.image} alt={item.name || item.label || "Win item"} />;
    }

    if (item?.icon) {
      return <FontAwesomeIcon className="modalFlashWin__visualIcon" icon={item.icon} style={{ color: item.iconColor }} />;
    }

    return <span className="modalFlashWin__visualLabel">{item?.name || item?.label || "Win"}</span>;
  }, []);

  const showFlashModal = useCallback(
    (modalContent, duration = FLASH_MODAL_DURATION_SECONDS) => {
      const safeDuration = Math.max(0.1, Number(duration) || FLASH_MODAL_DURATION_SECONDS);
      openModal({
        modalContent,
        flashModal: true,
        duration: safeDuration,
      });

      return new Promise((resolve) => {
        setTimeout(() => {
          closeModal();
          resolve();
        }, safeDuration * 1000 + 60);
      });
    },
    [closeModal, openModal]
  );

  const promptYesNo = useCallback(
    ({ title, content }) =>
      new Promise((resolve) => {
        openModal({
          modalTitle: title,
          modalContent: content,
          buttons: MODAL_BUTTONS.YES_NO,
          onYes: () => {
            closeModal();
            resolve(true);
          },
          onNo: () => {
            closeModal();
            resolve(false);
          },
        });
      }),
    [closeModal, openModal]
  );

  const applyMoneyDelta = useCallback(
    (delta) => {
      if (!delta) return;

      setGameState((prev) => {
        const active = prev.slotMachine;
        const nextMoney = Math.max(0, active.money + delta);

        return {
          ...prev,
          slotMachine: {
            ...active,
            money: nextMoney,
            stake: getClampedStake(active.stake, nextMoney),
          },
        };
      });
    },
    [setGameState]
  );

  const flashReelsForWin = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      slotMachine: {
        ...prev.slotMachine,
        winFlashActive: true,
      },
    }));

    return new Promise((resolve) => {
      setTimeout(() => {
        setGameState((prev) => ({
          ...prev,
          slotMachine: {
            ...prev.slotMachine,
            winFlashActive: false,
          },
        }));
        resolve();
      }, WIN_FLASH_DELAY_MS);
    });
  }, [setGameState]);

  const setBackboardTrailState = useCallback(
    (trailPatch) => {
      setGameState((prev) => ({
        ...prev,
        slotMachine: {
          ...prev.slotMachine,
          backboardTrail: {
            ...prev.slotMachine.backboardTrail,
            ...trailPatch,
          },
        },
      }));
    },
    [setGameState]
  );

  const resolveBackboardLanding = useCallback(
    async (initialTile) => {
      const theme = slotMachine.theme;
      const stake = slotMachine.stake;
      const maxTile = theme?.backboardConfig?.maxTile || 50;
      let tile = Math.max(1, Math.min(maxTile, initialTile));

      while (true) {
        const tileData = getBackboardTile(theme, tile);

        setBackboardTrailState({
          position: tile,
          pendingHiLoTile: null,
        });

        if (!tileData || tileData.effect === "blank" || tileData.effect === "start") {
          setBackboardTrailState({ status: "awaiting_roll" });
          return { exited: false };
        }

        if (tileData.effect === "jump") {
          await showFlashModal(
            <p>
              Tile {tile}: Jump Forward to tile {tileData.jumpTo}.
            </p>
          );
          tile = tileData.jumpTo || tile;
          continue;
        }

        if (tileData.effect === "hilo") {
          await showFlashModal(<p>Tile {tile}: Higher or Lower. Choose on the spinner controls.</p>);
          setGameState((prev) => ({
            ...prev,
            slotMachine: {
              ...prev.slotMachine,
              awaitingHiLoChoice: true,
              hiLoContext: "backboard",
              backboardTrail: {
                ...prev.slotMachine.backboardTrail,
                position: tile,
                status: "awaiting_hilo",
                pendingHiLoTile: tile,
              },
            },
          }));
          return { exited: false, awaitingChoice: true };
        }

        if (tileData.effect === "cashout_offer") {
          const payout = stake * (tileData.multiplier || 0);
          const cashOut = await promptYesNo({
            title: `Tile ${tile}: ${tileData.text}`,
            content: (
              <p>
                Cash out for {"\u00A3"}
                {payout.toFixed(2)} and return to reels?
              </p>
            ),
          });

          if (cashOut) {
            applyMoneyDelta(payout);
            await showFlashModal(
              <p>
                Backboard cash out: {"\u00A3"}
                {payout.toFixed(2)}
              </p>
            );
            returnToSlotsFromBackboard();
            return { exited: true };
          }

          await showFlashModal(<p>Stayed on the backboard. Roll again.</p>);
          setBackboardTrailState({ status: "awaiting_roll" });
          return { exited: false };
        }

        if (tileData.effect === "insta_win") {
          const payout = stake * (tileData.multiplier || 0);
          applyMoneyDelta(payout);
          await showFlashModal(
            <p>
              Insta win: {"\u00A3"}
              {payout.toFixed(2)}
            </p>
          );
          setBackboardTrailState({ status: "awaiting_roll" });
          return { exited: false };
        }

        if (tileData.effect === "pay_your_way") {
          if (slotMachine.money < stake) {
            await showFlashModal(<p>Not enough money to pay your way. Returning to reels.</p>);
            returnToSlotsFromBackboard();
            return { exited: true };
          }

          const payToStay = await promptYesNo({
            title: `Tile ${tile}: Pay your way`,
            content: (
              <p>
                Pay {"\u00A3"}
                {stake.toFixed(2)} to continue on the board?
              </p>
            ),
          });

          if (!payToStay) {
            await showFlashModal(<p>You left the backboard.</p>);
            returnToSlotsFromBackboard();
            return { exited: true };
          }

          applyMoneyDelta(-stake);
          await showFlashModal(
            <p>
              Paid {"\u00A3"}
              {stake.toFixed(2)}. Continue.
            </p>
          );
          setBackboardTrailState({ status: "awaiting_roll" });
          return { exited: false };
        }

        if (tileData.effect === "end") {
          await showFlashModal(<p>End tile reached. Returning to reels.</p>);
          returnToSlotsFromBackboard();
          return { exited: true };
        }

        if (tileData.effect === "setback") {
          await showFlashModal(<p>Setback tile. Rolling to move backward.</p>);
          const setbackRoll = await spinNumberSpinner({
            min: 1,
            max: 10,
            durationMs: BACKBOARD_SPINNER_DURATION_MS,
          });
          const setbackTarget = Math.max(1, tile - setbackRoll);
          await showFlashModal(
            <p>
              Setback roll {setbackRoll}: move to tile {setbackTarget}.
            </p>
          );
          tile = setbackTarget;
          continue;
        }

        if (tileData.effect === "win_your_roll") {
          await showFlashModal(<p>{tileData.text}: rolling now.</p>);
          const winRoll = await spinNumberSpinner({
            min: 1,
            max: 10,
            durationMs: BACKBOARD_SPINNER_DURATION_MS,
          });
          const payout = winRoll * (tileData.rollMultiplier || 1) * stake;
          applyMoneyDelta(payout);
          await showFlashModal(
            <p>
              Win your roll: {"\u00A3"}
              {payout.toFixed(2)}
            </p>
          );
          returnToSlotsFromBackboard();
          return { exited: true };
        }

        if (tileData.effect === "jackpot") {
          const payout = stake * (tileData.multiplier || 250);
          applyMoneyDelta(payout);
          await showFlashModal(
            <p>
              Jackpot: {"\u00A3"}
              {payout.toFixed(2)}
            </p>
          );
          returnToSlotsFromBackboard();
          return { exited: true };
        }

        setBackboardTrailState({ status: "awaiting_roll" });
        return { exited: false };
      }
    },
    [
      applyMoneyDelta,
      promptYesNo,
      returnToSlotsFromBackboard,
      setBackboardTrailState,
      setGameState,
      showFlashModal,
      slotMachine.money,
      slotMachine.stake,
      slotMachine.theme,
      spinNumberSpinner,
    ]
  );

  const rollBackboard = useCallback(async () => {
    if (backboardActionInProgressRef.current) return;
    if (slotMachine.screen !== "backboard") return;
    if (slotMachine.awaitingHiLoChoice) return;
    if (slotMachine.backboardSpinner.isSpinning || slotMachine.isSpinning) return;
    if (slotMachine.winFlashActive) return;
    if (slotMachine.backboardTrail.status !== "awaiting_roll") return;

    backboardActionInProgressRef.current = true;
    setBackboardTrailState({ status: "rolling" });

    try {
      const rollValue = await spinNumberSpinner({
        min: 1,
        max: 10,
        durationMs: BACKBOARD_SPINNER_DURATION_MS,
      });
      const currentTile = slotMachine.backboardTrail.position || 1;
      const maxTile = slotMachine.theme?.backboardConfig?.maxTile || 50;
      const overflowTargetTile = slotMachine.theme?.backboardConfig?.overflowTargetTile || 35;
      const rawTarget = currentTile + rollValue;
      const targetTile = rawTarget > maxTile ? overflowTargetTile : rawTarget;

      setBackboardTrailState({
        position: targetTile,
        lastRoll: rollValue,
        status: "resolving",
      });

      if (rawTarget > maxTile) {
        await showFlashModal(
          <p>
            Rolled {rollValue}. Passed tile {maxTile}, sent to tile {overflowTargetTile}.
          </p>
        );
      } else {
        await showFlashModal(
          <p>
            Rolled {rollValue}. Landed on tile {targetTile}.
          </p>
        );
      }

      await resolveBackboardLanding(targetTile);
    } finally {
      backboardActionInProgressRef.current = false;
    }
  }, [resolveBackboardLanding, setBackboardTrailState, showFlashModal, slotMachine, spinNumberSpinner]);

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
    if (slotMachine.winFlashActive) return;
    if (slotMachine.money < MIN_STAKE_TO_PLAY) return;
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

    // Stop reel motion immediately once physical spin is complete.
    setGameState((prev) => ({
      ...prev,
      slotMachine: {
        ...prev.slotMachine,
        reels: finalReels,
        isSpinning: false,
      },
    }));

    const { lineWin, matchedItem, payout } = evaluateLineWin(
      finalReels,
      slotMachine.theme.reelItems,
      stakeAtSpin
    );

    if (lineWin && payout > 0 && matchedItem) {
      await flashReelsForWin();
      await showFlashModal(
        <div className="modalFlashWin">
          <div className="modalFlashWin__visual">{renderWinVisual(matchedItem)}</div>
          <p className="modalFlashWin__amount">
            {"\u00A3"}
            {payout.toFixed(2)}
          </p>
        </div>
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
          hiLoContext: hiLoRequired ? "ladder" : null,
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
  }, [
    animateReels,
    flashReelsForWin,
    renderWinVisual,
    resolveLadderRewards,
    setGameState,
    showFlashModal,
    slotMachine,
    spinNumberSpinner,
  ]);

  const nudgeReel = useCallback(
    async (reelId, direction) => {
      if (nudgeInProgressRef.current) return;
      if (slotMachine.screen !== "slots" || slotMachine.isSpinning) return;
      if (slotMachine.winFlashActive) return;
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

      if (nudgeSnapshot.lineWin && nudgeSnapshot.payout > 0 && nudgeSnapshot.matchedItem) {
        await flashReelsForWin();
        await showFlashModal(
          <div className="modalFlashWin">
            <div className="modalFlashWin__visual">{renderWinVisual(nudgeSnapshot.matchedItem)}</div>
            <p className="modalFlashWin__amount">
              {"\u00A3"}
              {nudgeSnapshot.payout.toFixed(2)}
            </p>
          </div>
        );
      }

      try {
        const { holdsAwarded, nudgesAwarded, hiLoRequired } = await resolveLadderRewards(
          nudgeSnapshot.bonusItemsSeen,
          nudgeSnapshot.bonusLadderAfterSpin
        );

        setGameState((prev) => {
          const active = prev.slotMachine;
          const nextMoney = active.money + nudgeSnapshot.payout;
          const nextStake = getClampedStake(active.stake, nextMoney);
          const bonusRewardTriggered = holdsAwarded > 0 || nudgesAwarded > 0 || hiLoRequired;
          const nextNudges = nudgeSnapshot.lineWin || bonusRewardTriggered
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
              hiLoContext: active.awaitingHiLoChoice ? active.hiLoContext : hiLoRequired ? "ladder" : null,
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
    [flashReelsForWin, renderWinVisual, resolveLadderRewards, setGameState, showFlashModal, slotMachine]
  );

  const toggleHold = useCallback(
    (reelId) => {
      setGameState((prev) => {
        const active = prev.slotMachine;
        if (active.screen !== "slots" || active.isSpinning) return prev;
        if (active.winFlashActive) return prev;
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
      if (slotMachine.hiLoContext === "ladder" && slotMachine.screen !== "slots") return;
      if (slotMachine.hiLoContext === "backboard" && slotMachine.screen !== "backboard") return;
      if (slotMachine.winFlashActive) return;
      if (slotMachine.backboardSpinner.isSpinning || slotMachine.isSpinning) return;

      const previousValue = slotMachine.backboardSpinner.value;
      const nextValue = await spinNumberSpinner({ min: 1, max: 10, durationMs: BACKBOARD_SPINNER_DURATION_MS });
      const hiLoWin =
        choice === "higher"
          ? nextValue > previousValue
          : choice === "lower"
            ? nextValue < previousValue
            : false;
      const context = slotMachine.hiLoContext;

      if (context === "ladder") {
        if (hiLoWin) {
          await showFlashModal(<p>Higher or Lower correct. Backboard unlocked.</p>);
        } else {
          await showFlashModal(<p>Higher or Lower missed. Continue on reels.</p>);
        }

        setGameState((prev) => ({
          ...prev,
          slotMachine: {
            ...prev.slotMachine,
            awaitingHiLoChoice: false,
            hiLoContext: null,
            screen: hiLoWin ? "backboard" : "slots",
            backboardTrail: hiLoWin
              ? enterBackboardTrailState(prev.slotMachine.theme)
              : createInitialBackboardTrailState(prev.slotMachine.theme),
            lastSpin: {
              ...prev.slotMachine.lastSpin,
              bonusTriggered: hiLoWin,
              hiLoRequired: true,
              hiLoChoice: choice,
              hiLoWin,
            },
          },
        }));
        return;
      }

      if (context === "backboard") {
        if (hiLoWin) {
          await showFlashModal(<p>Correct. Stay on the backboard.</p>);
          setGameState((prev) => ({
            ...prev,
            slotMachine: {
              ...prev.slotMachine,
              awaitingHiLoChoice: false,
              hiLoContext: null,
              backboardTrail: {
                ...prev.slotMachine.backboardTrail,
                status: "awaiting_roll",
                pendingHiLoTile: null,
              },
            },
          }));
          return;
        }

        await showFlashModal(<p>Wrong guess. Returning to reels.</p>);
        returnToSlotsFromBackboard();
      }
    },
    [
      returnToSlotsFromBackboard,
      showFlashModal,
      setGameState,
      slotMachine.hiLoContext,
      slotMachine.awaitingHiLoChoice,
      slotMachine.nudgesRemaining,
      slotMachine.screen,
      slotMachine.backboardSpinner.isSpinning,
      slotMachine.backboardSpinner.value,
      slotMachine.isSpinning,
      slotMachine.winFlashActive,
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
      !slotMachine.winFlashActive &&
      slotMachine.money >= MIN_STAKE_TO_PLAY &&
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
      slotMachine.winFlashActive,
    ]
  );

  const canChooseHiLo = useMemo(
    () => {
      const canInteract =
        slotMachine.awaitingHiLoChoice &&
        slotMachine.nudgesRemaining <= 0 &&
        !slotMachine.winFlashActive &&
        !slotMachine.backboardSpinner.isSpinning &&
        !slotMachine.isSpinning;

      if (!canInteract) return false;
      if (slotMachine.hiLoContext === "ladder") return slotMachine.screen === "slots";
      if (slotMachine.hiLoContext === "backboard") return slotMachine.screen === "backboard";
      return false;
    },
    [
      slotMachine.awaitingHiLoChoice,
      slotMachine.backboardSpinner.isSpinning,
      slotMachine.hiLoContext,
      slotMachine.isSpinning,
      slotMachine.nudgesRemaining,
      slotMachine.screen,
      slotMachine.winFlashActive,
    ]
  );

  const canRollBackboard = useMemo(
    () =>
      slotMachine.screen === "backboard" &&
      slotMachine.backboardTrail.status === "awaiting_roll" &&
      !slotMachine.awaitingHiLoChoice &&
      !slotMachine.winFlashActive &&
      !slotMachine.backboardSpinner.isSpinning &&
      !slotMachine.isSpinning,
    [
      slotMachine.awaitingHiLoChoice,
      slotMachine.backboardSpinner.isSpinning,
      slotMachine.backboardTrail.status,
      slotMachine.isSpinning,
      slotMachine.screen,
      slotMachine.winFlashActive,
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
    rollBackboard,
    canSpin,
    canRollBackboard,
    canChooseHiLo,
    handleHiLoChoice,
  };
};
