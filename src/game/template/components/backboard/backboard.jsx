/* eslint-disable react/prop-types */
import "./backboard.scss";

const Backboard = ({ isActive, backboardTrail, BackboardComponent, backboardConfig }) => {
  const ActiveBackboardComponent = BackboardComponent;

  return (
    <section className={`templateBackboard ${isActive ? "templateBackboard--active" : ""}`}>
      <p className="templateBackboard__instruction">Roll the spinner on the right to progress through the trail</p>

      <div className="templateBackboard__surface">
        {ActiveBackboardComponent ? (
          <ActiveBackboardComponent
            isActive={isActive}
            backboardTrail={backboardTrail}
            backboardConfig={backboardConfig}
          />
        ) : (
          <p className="templateBackboard__placeholder">No backboard component set for this theme yet.</p>
        )}
      </div>
    </section>
  );
};

export default Backboard;
