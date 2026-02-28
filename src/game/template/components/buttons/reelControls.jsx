/* eslint-disable react/prop-types */
import Button, { BUTTON_VARIANT } from "../../../../engine/ui/button/button";
import "./reelControls.scss";

const ReelControlColumn = ({
  reelNumber,
  reelIndex,
  isHeld,
  showHold,
  showNudges,
  canNudge,
  canToggleHold,
  onNudge,
  onToggleHold,
}) => (
  <div className="templateReelControls__column">
    <h4>Reel {reelNumber}</h4>

    {showNudges && (
      <>
        <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onNudge(reelIndex, "up")} disabled={!canNudge}>
          Nudge Up
        </Button>
        <Button
          variant={BUTTON_VARIANT.TERTIARY}
          onClick={() => onNudge(reelIndex, "down")}
          disabled={!canNudge}
        >
          Nudge Down
        </Button>
      </>
    )}

    {showHold && (
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onToggleHold(reelIndex)} disabled={!canToggleHold}>
        {isHeld ? "Unhold" : "Hold"}
      </Button>
    )}
  </div>
);

const ReelControls = ({ slotMachine, onNudge, onToggleHold }) => {
  const showNudges = slotMachine.nudgesRemaining > 0;
  const heldCount = slotMachine.heldReels.filter(Boolean).length;
  const holdsAvailable = slotMachine.holdTokens.length;

  return (
    <section className="templateReelControls">
      {slotMachine.reels.map((reel, idx) => {
        const isHeld = slotMachine.heldReels[idx];
        const canNudge =
          showNudges && !slotMachine.isSpinning && slotMachine.screen === "slots" && !isHeld;
        const canToggleHold =
          !slotMachine.isSpinning &&
          slotMachine.screen === "slots" &&
          !(slotMachine.awaitingHiLoChoice && slotMachine.nudgesRemaining <= 0) &&
          (isHeld ||
            (heldCount < holdsAvailable && !(slotMachine.nudgesRemaining > 0 && heldCount >= 2)));
        const showHold = isHeld || holdsAvailable > 0;

        return (
          <ReelControlColumn
            key={`reel-controls-${reel.id}`}
            reelNumber={idx + 1}
            reelIndex={idx}
            isHeld={isHeld}
            showHold={showHold}
            showNudges={showNudges}
            canNudge={canNudge}
            canToggleHold={canToggleHold}
            onNudge={onNudge}
            onToggleHold={onToggleHold}
          />
        );
      })}
    </section>
  );
};

export default ReelControls;
