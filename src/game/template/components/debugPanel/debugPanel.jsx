/* eslint-disable react/prop-types */
import Button, { BUTTON_VARIANT } from "../../../../engine/ui/button/button";
import "./debugPanel.scss";

const DebugPanel = ({ onDebugMoney, onDebugHold, onDebugNudges, disabled = false }) => (
  <aside className="templateDebugPanel" aria-label="Debug controls">
    <h4>Debug</h4>
    <div className="templateDebugPanel__buttons">
      <Button variant={BUTTON_VARIANT.SECONDARY} onClick={onDebugMoney} disabled={disabled}>
        +{"\u00A3"}10
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={onDebugHold} disabled={disabled}>
        +1 Hold
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onDebugNudges(1)} disabled={disabled}>
        +1 Nudge
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onDebugNudges(2)} disabled={disabled}>
        +2 Nudges
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onDebugNudges(3)} disabled={disabled}>
        +3 Nudges
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onDebugNudges(4)} disabled={disabled}>
        +4 Nudges
      </Button>
      <Button variant={BUTTON_VARIANT.TERTIARY} onClick={() => onDebugNudges(5)} disabled={disabled}>
        +5 Nudges
      </Button>
    </div>
  </aside>
);

export default DebugPanel;
