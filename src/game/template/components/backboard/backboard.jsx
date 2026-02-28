/* eslint-disable react/prop-types */
import Button, { BUTTON_VARIANT } from "../../../../engine/ui/button/button";
import "./backboard.scss";

const Backboard = ({ isActive, awaitingHiLoChoice, onBackToSlots, BackboardComponent }) => {
  const statusText = isActive
    ? "Backboard active."
    : awaitingHiLoChoice
      ? "Ladder hit 12 or 25: choose Higher or Lower."
      : "Backboard ready.";

  const ActiveBackboardComponent = BackboardComponent;

  return (
    <section className={`templateBackboard ${isActive ? "templateBackboard--active" : ""}`}>
      <div className="templateBackboard__header">
        <h2>Backboard</h2>
        <p>{statusText}</p>
      </div>

      <div className="templateBackboard__surface">
        {ActiveBackboardComponent ? (
          <ActiveBackboardComponent isActive={isActive} />
        ) : (
          <p className="templateBackboard__placeholder">No backboard component set for this theme yet.</p>
        )}
      </div>

      {isActive && (
        <Button variant={BUTTON_VARIANT.PRIMARY} onClick={onBackToSlots}>
          Return to Reels
        </Button>
      )}
    </section>
  );
};

export default Backboard;
