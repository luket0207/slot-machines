/* eslint-disable react/prop-types */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./reelItem.scss";

const renderItemVisual = (item) => {
  if (item?.image) {
    return <img className="templateReelItem__image" src={item.image} alt={item.name || item.label || "Reel item"} />;
  }

  if (item?.icon) {
    return <FontAwesomeIcon className="templateReelItem__icon" icon={item.icon} style={{ color: item.iconColor }} />;
  }

  return <span className="templateReelItem__label">{item?.label || "?"}</span>;
};

const renderBonusVisual = (bonusItem) => {
  if (bonusItem?.image) {
    return <img className="templateReelItem__bonusImage" src={bonusItem.image} alt={bonusItem.name || "Bonus"} />;
  }

  if (bonusItem?.icon) {
    return <FontAwesomeIcon icon={bonusItem.icon} style={{ color: bonusItem.iconColor }} />;
  }

  return <span>B</span>;
};

const ReelItem = ({ item, bonusItem, isFocused, hasBonus, isHeld }) => {
  const hasThemedVisual = Boolean(item?.image || item?.icon);

  return (
    <div className={`templateReelItem ${isFocused ? "templateReelItem--focused" : ""}`}>
      <div className="templateReelItem__content">
        {renderItemVisual(item)}
        {hasThemedVisual && <span className="templateReelItem__name">{item?.name || item?.label || "?"}</span>}
      </div>
      {hasBonus && (
        <span className="templateReelItem__bonus" title={bonusItem?.name || "Bonus"}>
          {renderBonusVisual(bonusItem)}
        </span>
      )}
      {isHeld && <span className="templateReelItem__held">HOLD</span>}
    </div>
  );
};

export default ReelItem;
