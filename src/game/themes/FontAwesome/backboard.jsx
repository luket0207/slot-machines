/* eslint-disable react/prop-types */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./backboard.scss";

const FontAwesomeBackboard = ({ isActive, backboardTrail, backboardConfig }) => {
  const tiles = backboardConfig?.tiles || [];
  const activeTile = backboardTrail?.position || 1;

  return (
    <div className={`fontAwesomeBackboard ${isActive ? "fontAwesomeBackboard--active" : ""}`}>
      <div
        className="fontAwesomeBackboard__grid"
        style={{
          "--trail-columns": backboardConfig?.gridColumns || 10,
        }}
      >
        {tiles.map((tile) => (
          <article
            key={`trail-tile-${tile.tile}`}
            className={`fontAwesomeBackboard__tile ${
              tile.tile === activeTile ? "fontAwesomeBackboard__tile--active" : ""
            } ${tile.effect !== "blank" ? "fontAwesomeBackboard__tile--special" : ""}`}
          >
            <span className="fontAwesomeBackboard__tileNumber">{tile.tile}</span>
            {tile.icon && (
              <span className="fontAwesomeBackboard__tileIcon">
                <FontAwesomeIcon icon={tile.icon} />
              </span>
            )}
            {tile.text && <span className="fontAwesomeBackboard__tileText">{tile.text}</span>}
          </article>
        ))}
      </div>
    </div>
  );
};

export default FontAwesomeBackboard;
