import { useMemo } from "react";
import StartScreen from "./components/startScreen/startScreen";
import SlotScreen from "./components/slotScreen/slotScreen";
import { useSlotMachineGame } from "./hooks/useSlotMachineGame";
import { buildThemeStyleVars } from "./utils/slotConfig";
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
    canChooseHiLo,
    rollBackboard,
    canRollBackboard,
    handleHiLoChoice,
  } = useSlotMachineGame();

  const themeStyleVars = useMemo(() => buildThemeStyleVars(slotMachine.theme), [slotMachine.theme]);

  if (slotMachine.screen === "start") {
    return (
      <main className="templateGame" style={themeStyleVars}>
        <StartScreen onStart={startGame} money={slotMachine.money} themeName={slotMachine.theme.name} />
      </main>
    );
  }

  return (
    <main className="templateGame" style={themeStyleVars}>
      <SlotScreen
        slotMachine={slotMachine}
        onStakeChange={setStake}
        onDebugMoney={addDebugMoney}
        onDebugHold={addDebugHold}
        onDebugNudges={addDebugNudges}
        onSpin={spin}
        canSpin={canSpin}
        canChooseHiLo={canChooseHiLo}
        onChooseHigher={() => handleHiLoChoice("higher")}
        onChooseLower={() => handleHiLoChoice("lower")}
        onRollBackboard={rollBackboard}
        canRollBackboard={canRollBackboard}
        onNudgeReel={nudgeReel}
        onToggleHold={toggleHold}
      />
    </main>
  );
};

export default TemplateGame;
