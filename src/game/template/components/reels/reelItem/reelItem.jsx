/* eslint-disable react/prop-types */
import "./reelItem.scss";

const ReelItem = ({ label, isFocused, hasBonus, isHeld }) => (
  <div className={`templateReelItem ${isFocused ? "templateReelItem--focused" : ""}`}>
    <span>{label}</span>
    {hasBonus && <span className="templateReelItem__bonus">B</span>}
    {isHeld && <span className="templateReelItem__held">HOLD</span>}
  </div>
);

export default ReelItem;
