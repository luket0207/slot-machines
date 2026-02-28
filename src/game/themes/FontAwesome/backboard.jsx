/* eslint-disable react/prop-types */
import "./backboard.scss";

const FontAwesomeBackboard = ({ isActive }) => (
  <div className={`fontAwesomeBackboard ${isActive ? "fontAwesomeBackboard--active" : ""}`}>
    <p className="fontAwesomeBackboard__title">Forest Bonus Board</p>
    <p className="fontAwesomeBackboard__hint">Theme-specific backboard gameplay will be added here.</p>
  </div>
);

export default FontAwesomeBackboard;
