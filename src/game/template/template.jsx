import StartScreen from "./components/startScreen/startScreen";
import SlotScreen from "./components/slotScreen/slotScreen";
import { useSlotMachineGame } from "./hooks/useSlotMachineGame";
import "./template.scss";

const TemplateGame = () => {
  const {
    slotMachine,
    startGame,
    setStake,
    addDebugMoney,
    addDebugHold,
    addDebugNudges,
    spin,
    nudgeReel,
    toggleHold,
    canSpin,
    backToSlots,
    canChooseHiLo,
    handleHiLoChoice,
  } = useSlotMachineGame();

  if (slotMachine.screen === "start") {
    return <StartScreen onStart={startGame} money={slotMachine.money} />;
  }

  return (
    <main className="templateGame">
      <SlotScreen
        slotMachine={slotMachine}
        onStakeChange={setStake}
        onDebugMoney={addDebugMoney}
        onDebugHold={addDebugHold}
        onDebugNudges={addDebugNudges}
        onSpin={spin}
        canSpin={canSpin}
        onBackToSlots={backToSlots}
        canChooseHiLo={canChooseHiLo}
        onChooseHigher={() => handleHiLoChoice("higher")}
        onChooseLower={() => handleHiLoChoice("lower")}
        onNudgeReel={nudgeReel}
        onToggleHold={toggleHold}
      />
    </main>
  );
};

export default TemplateGame;
