/* eslint-disable react/prop-types */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip } from "primereact/tooltip";
import "./bonusLadder.scss";

const BONUS_SPACES = 25;
const NUDGE_STEPS = new Set([18]);
const HOLD_STEPS = new Set([7, 22]);
const TRIGGER_STEPS = new Set([12, 25]);

const renderBonusVisual = (bonusItem) => {
  if (bonusItem?.image) {
    return <img src={bonusItem.image} alt={bonusItem.name || "Bonus item"} />;
  }

  if (bonusItem?.icon) {
    return <FontAwesomeIcon icon={bonusItem.icon} style={{ color: bonusItem.iconColor }} />;
  }

  return <span>B</span>;
};

const BonusLadder = ({ value, bonusItem }) => (
  <section className="templateBonusLadder">
    <Tooltip target=".templateBonusLadder__tooltipTarget" position="top" />

    <p className="templateBonusLadder__instruction">
      Spin
      <span className="templateBonusLadder__bonusItem">
        <i>{renderBonusVisual(bonusItem)}</i>
        {bonusItem?.name || "Bonus"}
      </span>
      into view to gain bonus points.
    </p>

    <div className="templateBonusLadder__track">
      {Array.from({ length: BONUS_SPACES }, (_, idx) => idx + 1).map((step) => (
        (() => {
          const isNudge = NUDGE_STEPS.has(step);
          const isHold = HOLD_STEPS.has(step);
          const isTrigger = TRIGGER_STEPS.has(step);
          const classes = [
            "templateBonusLadder__step",
            step <= value ? "templateBonusLadder__step--filled" : "",
            isTrigger ? "templateBonusLadder__step--trigger" : "",
            isNudge ? "templateBonusLadder__step--nudge" : "",
            isHold ? "templateBonusLadder__step--hold" : "",
          ]
            .filter(Boolean)
            .join(" ");

          let rewardText = "Normal";
          if (isNudge) rewardText = "Nudges";
          if (isHold) rewardText = "Hold";
          if (isTrigger) rewardText = "Backboard Check";
          const marker = isTrigger ? "B" : isNudge ? "N" : isHold ? "H" : null;

          return (
            <span key={`bonus-step-${step}`} className={classes}>
              {marker ? (
                <span
                  className="templateBonusLadder__tooltipTarget"
                  data-pr-tooltip={rewardText}
                  aria-label={rewardText}
                >
                  <i className="templateBonusLadder__marker">{marker}</i>
                </span>
              ) : null}
            </span>
          );
        })()
      ))}
    </div>
  </section>
);

export default BonusLadder;
