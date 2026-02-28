/* eslint-disable react/prop-types */
import "./numberSpinner.scss";

const SPINNER_MIN = 1;
const SPINNER_MAX = 10;

const wrapSpinnerValue = (input) => {
  if (input < SPINNER_MIN) return SPINNER_MAX;
  if (input > SPINNER_MAX) return SPINNER_MIN;
  return input;
};

const NumberSpinner = ({ value, isSpinning, className = "" }) => {
  const currentValue = Number.isFinite(value) ? value : SPINNER_MIN;
  const windowValues = [
    wrapSpinnerValue(currentValue - 1),
    wrapSpinnerValue(currentValue),
    wrapSpinnerValue(currentValue + 1),
  ];

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
    </div>
  );
};

export default NumberSpinner;
