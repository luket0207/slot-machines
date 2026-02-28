/* eslint-disable react/prop-types */
import Button, { BUTTON_VARIANT } from "../../../../engine/ui/button/button";
import "./startScreen.scss";

const StartScreen = ({ onStart, money, themeName }) => (
  <section className="templateStartScreen">
    <div className="templateStartScreen__card">
      <h1>{themeName || "Template Slot Machine"}</h1>
      <p>Press start to launch the reels.</p>
      <p className="templateStartScreen__bankroll">
        Starting money: {"\u00A3"}
        {money.toFixed(2)}
      </p>
      <Button variant={BUTTON_VARIANT.PRIMARY} onClick={onStart}>
        Start Game
      </Button>
    </div>
  </section>
);

export default StartScreen;
