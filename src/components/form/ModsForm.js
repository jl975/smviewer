import React, { useState } from "react";
import { Radio } from "semantic-ui-react";

import { options } from "./options";
import { capitalize } from "../../utils";

const ModsForm = (props) => {
  const {
    activeView,
    simfileList,
    selectedDifficulty,
    mods,
    setMods,
    gameEngine,
  } = props;

  const [timeProgress, setTimeProgress] = useState(0);

  // useEffect(() => {
  //   if (!gameEngine) return;
  //   const ge = gameEngine;

  //   if (ge.tl) {
  //     // console.log("timeline is this long", ge.tl.duration());
  //   }
  // }, [gameEngine]);

  const updateMods = (updatedMods) => {
    setMods({ ...mods, ...updatedMods });
  };

  const getChartDuration = () => {
    if (!gameEngine || !gameEngine.tl) return 0;
    const duration = gameEngine.tl.duration();
    return duration;
  };

  // const timeProgressSettings = {
  //   min: 0,
  //   max: getChartDuration(),
  //   step: 0.01,
  //   onChange: value => {
  //     // console.log("onChange value", value);
  //     setTimeProgress(value);
  //     gameEngine.tl.seek(value);
  //   },
  // };

  return (
    <div
      className={`form-container ${activeView === "mods" ? "open" : "closed"}`}
    >
      <form>
        <div className="form-field">
          <h4 className="form-label">Speed</h4>
          {options.mods.speed.map((speed) => {
            return (
              <Radio
                key={`speed_${speed}`}
                label={`${speed}x`}
                name="speed"
                value={speed}
                checked={mods.speed === speed}
                onChange={() => updateMods({ speed })}
              />
            );
          })}
        </div>

        <div className="form-field">
          <h4 className="form-label">Arrow color</h4>
          {options.mods.noteskin.map((noteskin) => {
            return (
              <Radio
                key={`noteskin_${noteskin}`}
                label={capitalize(noteskin)}
                name="noteskin"
                value={noteskin}
                checked={mods.noteskin === noteskin}
                onChange={() => updateMods({ noteskin })}
              />
            );
          })}
        </div>

        <div className="form-field">
          <h4 className="form-label">Turn</h4>
          {options.mods.turn.map((turn) => {
            return (
              <Radio
                key={`turn_${turn}`}
                label={capitalize(turn)}
                name="turn"
                value={turn}
                checked={mods.turn === turn}
                onChange={() => updateMods({ turn })}
              />
            );
          })}
        </div>
        {mods.turn === "shuffle" && (
          <div className="form-field">
            <h4 className="form-label">Shuffle pattern</h4>
            {options.mods.shuffle.map((shuffle) => {
              return (
                <Radio
                  key={`shuffle_${shuffle}`}
                  label={shuffle}
                  name="shuffle"
                  value={shuffle}
                  checked={mods.shuffle === shuffle}
                  onChange={() => updateMods({ shuffle })}
                />
              );
            })}
          </div>
        )}

        {/* <div className="form-field">
          <h4 className="form-label">Time progress</h4>
        </div> */}
      </form>
    </div>
  );
};

export default ModsForm;
