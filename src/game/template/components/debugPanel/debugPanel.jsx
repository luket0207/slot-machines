/* eslint-disable react/prop-types */
import Button, { BUTTON_VARIANT } from "../../../../engine/ui/button/button";
import "./debugPanel.scss";

const DebugPanel = ({ onDebugMoney, onDebugHold, onDebugNudges }) => (
  <aside className="templateDebugPanel" aria-label="Debug controls">
    <h4>Debug</h4>
    <div className="templateDebugPanel__buttons">
      <Button variant={BUTTON_VARIANT.SECONDARY} onClick={onDebugMoney}>
        +{"\u00A3"}10
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={onDebugHold}>
        +1 Hold
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onDebugNudges(1)}>
        +1 Nudge
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onDebugNudges(2)}>
        +2 Nudges
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onDebugNudges(3)}>
        +3 Nudges
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onDebugNudges(4)}>
        +4 Nudges
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onDebugNudges(5)}>
        +5 Nudges
      </Button>
    </div>
  </aside>
);

export default DebugPanel;
