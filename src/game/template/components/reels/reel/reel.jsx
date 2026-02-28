/* eslint-disable react/prop-types */
import ReelItem from "../reelItem/reelItem";
import { getVisibleIndexes } from "../../../utils/reelUtils";
import "./reel.scss";

const Reel = ({ reel, reelItemsById, bonusItem, isHeld, isSpinning }) => {
  const visibleIndexes = getVisibleIndexes(reel.index, reel.strip.length);

  return (
    <div className={`templateReel ${isHeld ? "templateReel--held" : ""} ${isSpinning ? "templateReel--spinning" : ""}`}>
      <div className="templateReel__track">
        {visibleIndexes.map((stripIndex, rowIndex) => {
          const itemId = reel.strip[stripIndex];
          const item = reelItemsById[itemId];
          const hasBonus = reel.bonusPositions.includes(stripIndex);

          return (
            <ReelItem
              key={`${reel.id}-${stripIndex}-${rowIndex}`}
              item={item}
              bonusItem={bonusItem}
              isFocused={rowIndex === 1}
              hasBonus={hasBonus}
              isHeld={isHeld && rowIndex === 1}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Reel;
