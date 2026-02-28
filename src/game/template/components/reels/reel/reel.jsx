/* eslint-disable react/prop-types */
import ReelItem from "../reelItem/reelItem";
import { getVisibleIndexes } from "../../../utils/reelUtils";
import "./reel.scss";

const Reel = ({ reel, reelItemsById, isHeld }) => {
  const visibleIndexes = getVisibleIndexes(reel.index, reel.strip.length);

  return (
    <div className={`templateReel ${isHeld ? "templateReel--held" : ""}`}>
      {visibleIndexes.map((stripIndex, rowIndex) => {
        const itemId = reel.strip[stripIndex];
        const item = reelItemsById[itemId];
        const hasBonus = reel.bonusPositions.includes(stripIndex);

        return (
          <ReelItem
            key={`${reel.id}-${stripIndex}-${rowIndex}`}
            label={item?.label || "?"}
            isFocused={rowIndex === 1}
            hasBonus={hasBonus}
            isHeld={isHeld && rowIndex === 1}
          />
        );
      })}
    </div>
  );
};

export default Reel;
