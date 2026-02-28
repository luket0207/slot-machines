/* eslint-disable react/prop-types */
import { useMemo } from "react";
import Button, { BUTTON_VARIANT } from "../../../../engine/ui/button/button";
import Reel from "./reel/reel";
import "./reelsContainer.scss";

const ReelsContainer = ({ slotMachine, onNudge, onToggleHold }) => {
  const { reels, theme, heldReels } = slotMachine;

  const reelItemsById = useMemo(
    () =>
      theme.reelItems.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {}),
    [theme.reelItems]
  );

  const showNudges = slotMachine.nudgesRemaining > 0;
  const heldCount = slotMachine.heldReels.filter(Boolean).length;
  const holdsAvailable = slotMachine.holdTokens.length;

  return (
    <section className="templateReelsContainer">
      <div className="templateReelsContainer__line" />
      {reels.map((reel, idx) => {
        const isHeld = slotMachine.heldReels[idx];
        const canNudge =
          showNudges && !slotMachine.isSpinning && slotMachine.screen === "slots" && !isHeld;
        const canToggleHold =
          !slotMachine.isSpinning &&
          slotMachine.screen === "slots" &&
          !(slotMachine.awaitingHiLoChoice && slotMachine.nudgesRemaining <= 0) &&
          (isHeld || (heldCount < holdsAvailable && !(slotMachine.nudgesRemaining > 0 && heldCount >= 2)));
        const showHold = isHeld || holdsAvailable > 0;

        return (
          <div key={`reel-column-${reel.id}`} className="templateReelsContainer__column">
            <Reel
              reel={reel}
              reelItemsById={reelItemsById}
              bonusItem={theme.bonusItem}
              isHeld={Boolean(heldReels?.[idx])}
            />

            <div className="templateReelsContainer__controls">
              {showNudges && (
                <>
                  <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onNudge(idx, "up")} disabled={!canNudge}>
                    Nudge Up
                  </Button>
                  <Button
                    variant={BUTTON_VARIANT.TERTIARY}
                    onClick={() => onNudge(idx, "down")}
                    disabled={!canNudge}
                  >
                    Nudge Down
                  </Button>
                </>
              )}

              {showHold && (
                <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onToggleHold(idx)} disabled={!canToggleHold}>
                  {isHeld ? "Unhold" : "Hold"}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default ReelsContainer;
