import React, { useState } from "react";
import { connect } from "react-redux";
import { Radio, Checkbox } from "semantic-ui-react";

import { options } from "./options";
import { capitalize } from "../../utils";
import { updateMods } from "../../actions/ModsActions";

const ModsForm = (props) => {
  const {
    activeView,
    simfileList,
    selectedDifficulty,
    mods,
    gameEngine,
    updateMods,
  } = props;

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

        <h4>Miscellaneous</h4>
        <div className="form-field">
          <Checkbox
            toggle
            label="Guidelines"
            name="guidelines"
            checked={mods.guidelines}
            onChange={() => updateMods({ guidelines: !mods.guidelines })}
          />
        </div>
        <div className="form-field">
          <Checkbox
            toggle
            label="Color freeze heads"
            name="colorFreezes"
            checked={mods.colorFreezes}
            onChange={() => updateMods({ colorFreezes: !mods.colorFreezes })}
          />
        </div>
      </form>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { mods } = state;
  return { mods };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateMods: (mods) => dispatch(updateMods(mods)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModsForm);
