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
  onBackToSlots,
  onChooseHigher,
  onChooseLower,
  canChooseHiLo,
  onNudgeReel,
  onToggleHold,
}) => (
  <section className="templateSlotScreen">
    <Scoreboard
      money={slotMachine.money}
      lastSpin={slotMachine.lastSpin}
      slotMachine={slotMachine}
    />

    <div className="templateSlotScreen__main">
      <DebugPanel onDebugMoney={onDebugMoney} onDebugHold={onDebugHold} onDebugNudges={onDebugNudges} />

      <div className="templateSlotScreen__backboardWrap">
        <Backboard
          isActive={slotMachine.screen === "backboard"}
          awaitingHiLoChoice={slotMachine.awaitingHiLoChoice}
          onBackToSlots={onBackToSlots}
          BackboardComponent={slotMachine.theme.backboardComponent}
        />
        <NumberSpinner
          value={slotMachine.backboardSpinner.value}
          isSpinning={slotMachine.backboardSpinner.isSpinning}
          className="templateSlotScreen__numberSpinner"
        />
      </div>

      <BonusLadder value={slotMachine.bonusLadder} bonusItem={slotMachine.theme.bonusItem} />

      <ReelsContainer slotMachine={slotMachine} onNudge={onNudgeReel} onToggleHold={onToggleHold} />

      <MainButtons
        onSpin={onSpin}
        canSpin={canSpin}
        onChooseHigher={onChooseHigher}
        onChooseLower={onChooseLower}
        canChooseHiLo={canChooseHiLo}
        stake={slotMachine.stake}
        stakeOptions={slotMachine.stakeOptions}
        onStakeChange={onStakeChange}
        isStakeLocked={!canSpin}
      />
    </div>
  </section>
);

export default SlotScreen;
