/* eslint-disable react/prop-types */
import { formatMoney } from "../../utils/formatters";
import "./scoreboard.scss";

const Scoreboard = ({
  money,
  lastSpin,
  slotMachine,
}) => (
  <section className="templateScoreboard">
    <div className="templateScoreboard__values">
      <div>
        <span>Money</span>
        <strong>{formatMoney(money)}</strong>
      </div>
      <div>
        <span>Holds</span>
        <strong>{slotMachine.holdTokens.length}</strong>
      </div>
      <div>
        <span>Nudges</span>
        <strong>{slotMachine.nudgesRemaining}</strong>
      </div>
    </div>

    <div className="templateScoreboard__result">
      {lastSpin.lineWin && <p>Line win: {formatMoney(lastSpin.payout)}</p>}
      {!lastSpin.lineWin && <p>No line win on last action.</p>}
      <p>Bonus items seen: {lastSpin.bonusItemsSeen}</p>
      <p>Bonus ladder after action: {lastSpin.bonusLadderAfterSpin}/25</p>
      {lastSpin.holdsAwarded > 0 && <p>Holds awarded: +{lastSpin.holdsAwarded}</p>}
      {lastSpin.nudgesAwarded > 0 && <p>Nudges awarded: +{lastSpin.nudgesAwarded}</p>}
      {lastSpin.hiLoRequired && lastSpin.hiLoChoice == null && <p>Hit 12/25: choose Higher or Lower.</p>}
      {lastSpin.hiLoChoice != null && (
        <p>
          Higher/Lower ({lastSpin.hiLoChoice}): {lastSpin.hiLoWin ? "win" : "lose"}
        </p>
      )}
      {slotMachine.nudgesRemaining > 0 && <p>Use all nudges before spinning again.</p>}
      {lastSpin.bonusTriggered && <p>Bonus triggered: backboard unlocked.</p>}
    </div>
  </section>
);

export default Scoreboard;
