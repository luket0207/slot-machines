/* eslint-disable react/prop-types */
import MainButtons from "../buttons/mainButtons";
import ReelsContainer from "../reels/reelsContainer";
import Scoreboard from "../scoreboard/scoreboard";
import DebugPanel from "../debugPanel/debugPanel";
import BonusLadder from "../bonusLadder/bonusLadder";
import Backboard from "../backboard/backboard";
import NumberSpinner from "../backboard/numberSpinner/numberSpinner";
import "./slotScreen.scss";

const SlotScreen = ({
  slotMachine,
  onStakeChange,
  onDebugMoney,
  onDebugHold,
  onDebugNudges,
  onSpin,
  canSpin,
  onChooseHigher,
  onChooseLower,
  canChooseHiLo,
  onRollBackboard,
  canRollBackboard,
  onNudgeReel,
  onToggleHold,
}) => {
  const areButtonsDisabled = slotMachine.winFlashActive;

  return (
    <section className="templateSlotScreen">
      <Scoreboard
        money={slotMachine.money}
        lastSpin={slotMachine.lastSpin}
        slotMachine={slotMachine}
      />

      <div className="templateSlotScreen__main">
        <DebugPanel
          onDebugMoney={onDebugMoney}
          onDebugHold={onDebugHold}
          onDebugNudges={onDebugNudges}
          disabled={areButtonsDisabled}
        />

        <div className="templateSlotScreen__backboardRow">
          <div className="templateSlotScreen__backboardColumn">
            <Backboard
              isActive={slotMachine.screen === "backboard"}
              awaitingHiLoChoice={slotMachine.awaitingHiLoChoice}
              hiLoContext={slotMachine.hiLoContext}
              backboardTrail={slotMachine.backboardTrail}
              backboardConfig={slotMachine.theme.backboardConfig}
              BackboardComponent={slotMachine.theme.backboardComponent}
            />
          </div>
          <div className="templateSlotScreen__spinnerColumn">
            <NumberSpinner
              value={slotMachine.backboardSpinner.value}
              isSpinning={slotMachine.backboardSpinner.isSpinning}
              canChooseHiLo={canChooseHiLo}
              onChooseHigher={onChooseHigher}
              onChooseLower={onChooseLower}
              canRollBackboard={canRollBackboard}
              onRollBackboard={onRollBackboard}
              controlsDisabled={areButtonsDisabled}
              className="templateSlotScreen__numberSpinner"
            />
          </div>
        </div>

        <BonusLadder value={slotMachine.bonusLadder} bonusItem={slotMachine.theme.bonusItem} />

        <ReelsContainer
          slotMachine={slotMachine}
          onNudge={onNudgeReel}
          onToggleHold={onToggleHold}
          controlsDisabled={areButtonsDisabled}
        />

        <MainButtons
          onSpin={onSpin}
          canSpin={canSpin}
          stake={slotMachine.stake}
          stakeOptions={slotMachine.stakeOptions}
          onStakeChange={onStakeChange}
          isStakeLocked={!canSpin || areButtonsDisabled}
          isButtonsDisabled={areButtonsDisabled}
        />
      </div>
    </section>
  );
};

export default SlotScreen;
