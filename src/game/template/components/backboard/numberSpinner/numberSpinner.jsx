/* eslint-disable react/prop-types */
import Button, { BUTTON_VARIANT } from "../../../../../engine/ui/button/button";
import "./numberSpinner.scss";

const SPINNER_MIN = 1;
const SPINNER_MAX = 10;

const wrapSpinnerValue = (input) => {
  if (input < SPINNER_MIN) return SPINNER_MAX;
  if (input > SPINNER_MAX) return SPINNER_MIN;
  return input;
};

const NumberSpinner = ({
  value,
  isSpinning,
  className = "",
  canChooseHiLo = false,
  onChooseHigher,
  onChooseLower,
  canRollBackboard = false,
  onRollBackboard,
  controlsDisabled = false,
}) => {
  const currentValue = Number.isFinite(value) ? value : SPINNER_MIN;
  const windowValues = [
    wrapSpinnerValue(currentValue - 1),
    wrapSpinnerValue(currentValue),
    wrapSpinnerValue(currentValue + 1),
  ];
  const showHiLo = !canRollBackboard;
  const showRoll = canRollBackboard && !showHiLo;
  const highlightControls =
    (showRoll || canChooseHiLo) && !controlsDisabled && !isSpinning;

  return (
    <div
      className={`templateNumberSpinner ${isSpinning ? "templateNumberSpinner--spinning" : ""} ${className}`.trim()}
    >
      <span className="templateNumberSpinner__label">Number Spinner</span>
      <div className="templateNumberSpinner__viewport" aria-live="polite">
        <div className="templateNumberSpinner__track">
          {windowValues.map((number, index) => (
            <div
              key={`${number}-${index}`}
              className={`templateNumberSpinner__cell ${index === 1 ? "templateNumberSpinner__cell--focused" : ""}`}
            >
              {number}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`templateNumberSpinner__controls ${
          highlightControls ? "templateNumberSpinner__controls--attention" : ""
        }`}
      >
        {showHiLo && (
          <div className="templateNumberSpinner__hiLoButtons">
            <Button
              variant={BUTTON_VARIANT.SECONDARY}
              onClick={onChooseLower}
              disabled={!canChooseHiLo || controlsDisabled || isSpinning}
            >
              Lower
            </Button>
            <Button
              variant={BUTTON_VARIANT.SECONDARY}
              onClick={onChooseHigher}
              disabled={!canChooseHiLo || controlsDisabled || isSpinning}
            >
              Higher
            </Button>
          </div>
        )}

        {showRoll && (
          <Button
            variant={BUTTON_VARIANT.PRIMARY}
            onClick={onRollBackboard}
            disabled={!canRollBackboard || controlsDisabled || isSpinning}
            className="templateNumberSpinner__rollButton"
          >
            Roll
          </Button>
        )}
      </div>
    </div>
  );
};

export default NumberSpinner;
