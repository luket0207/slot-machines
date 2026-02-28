/* eslint-disable react/prop-types */
import Button, { BUTTON_VARIANT } from "../../../../engine/ui/button/button";
import { formatMoney } from "../../utils/formatters";
import "./mainButtons.scss";

const MainButtons = ({
  onSpin,
  canSpin,
  onChooseHigher,
  onChooseLower,
  canChooseHiLo,
  stake,
  stakeOptions,
  onStakeChange,
  isStakeLocked,
  isButtonsDisabled = false,
}) => (
  <div className="templateMainButtons">
    <div className="templateMainButtons__left">
      <Button variant={BUTTON_VARIANT.SECONDARY} onClick={onChooseHigher} disabled={!canChooseHiLo || isButtonsDisabled}>
        Higher
      </Button>
      <Button variant={BUTTON_VARIANT.SECONDARY} onClick={onChooseLower} disabled={!canChooseHiLo || isButtonsDisabled}>
        Lower
      </Button>
    </div>

    <div className="templateMainButtons__right">
      <div className="templateMainButtons__stake" role="radiogroup" aria-label="Stake">
        <div className="templateMainButtons__stakeButtons">
          {stakeOptions.map((option) => (
            <Button
              key={`stake-${option}`}
              variant={BUTTON_VARIANT.TERTIARY}
              onClick={() => onStakeChange(option)}
              disabled={isStakeLocked || isButtonsDisabled}
              className={`templateMainButtons__stakeButton ${
                option === stake ? "templateMainButtons__stakeButton--selected" : ""
              }`}
            >
              {formatMoney(option)}
            </Button>
          ))}
        </div>
      </div>

      <Button
        variant={BUTTON_VARIANT.PRIMARY}
        onClick={onSpin}
        disabled={!canSpin || isButtonsDisabled}
        className="templateMainButtons__spinButton"
      >
        Spin
      </Button>
    </div>
  </div>
);

export default MainButtons;
