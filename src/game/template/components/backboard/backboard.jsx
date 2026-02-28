/* eslint-disable react/prop-types */
import Button, { BUTTON_VARIANT } from "../../../../engine/ui/button/button";
import NumberSpinner from "./numberSpinner/numberSpinner";
import "./backboard.scss";

const Backboard = ({ spinner, isActive, awaitingHiLoChoice, onBackToSlots }) => {
  const statusText = isActive
    ? "Backboard active."
    : awaitingHiLoChoice
      ? "Ladder hit 12 or 25: choose Higher or Lower."
      : "Backboard ready.";

  return (
    <section className={`templateBackboard ${isActive ? "templateBackboard--active" : ""}`}>
      <div className="templateBackboard__header">
        <h2>Backboard</h2>
        <p>{statusText}</p>
      </div>

      <NumberSpinner value={spinner.value} isSpinning={spinner.isSpinning} />

      {isActive && (
        <Button variant={BUTTON_VARIANT.PRIMARY} onClick={onBackToSlots}>
          Return to Reels
        </Button>
      )}
    </section>
  );
};

export default Backboard;
