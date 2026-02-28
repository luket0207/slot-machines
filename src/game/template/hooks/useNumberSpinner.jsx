import { useCallback } from "react";
import { useGame } from "../../../engine/gameContext/gameContext";

export const useNumberSpinner = () => {
  const { setGameState } = useGame();

  const spinNumberSpinner = useCallback(({ min = 1, max = 10, durationMs = 1300, tickMs = 80 } = {}) => {
    setGameState((prev) => ({
      ...prev,
      slotMachine: {
        ...prev.slotMachine,
        backboardSpinner: {
          ...prev.slotMachine.backboardSpinner,
          isSpinning: true,
        },
      },
    }));

    return new Promise((resolve) => {
      let finalValue = min;

      const interval = setInterval(() => {
        const value = Math.floor(Math.random() * (max - min + 1)) + min;
        finalValue = value;
        setGameState((prev) => ({
          ...prev,
          slotMachine: {
            ...prev.slotMachine,
            backboardSpinner: {
              value,
              isSpinning: true,
            },
          },
        }));
      }, tickMs);

      setTimeout(() => {
        clearInterval(interval);
        setGameState((prev) => ({
          ...prev,
          slotMachine: {
            ...prev.slotMachine,
            backboardSpinner: {
              ...prev.slotMachine.backboardSpinner,
              isSpinning: false,
            },
          },
        }));
        resolve(finalValue);
      }, durationMs);
    });
  }, [setGameState]);

  return { spinNumberSpinner };
};
