/* eslint-disable react/prop-types */
import "./numberSpinner.scss";

const NumberSpinner = ({ value, isSpinning, className = "" }) => (
  <div
    className={`templateNumberSpinner ${isSpinning ? "templateNumberSpinner--spinning" : ""} ${className}`.trim()}
  >
    <span className="templateNumberSpinner__label">Number Spinner</span>
    <strong>{value}</strong>
  </div>
);

export default NumberSpinner;
