import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Radio, Checkbox } from "semantic-ui-react";

import { options } from "./options";
import { SP_DIFFICULTIES, DP_DIFFICULTIES } from "../../constants";
import { capitalize } from "../../utils";
import { updateMods } from "../../actions/ModsActions";

const ModsForm = (props) => {
  const { mods, updateMods, mode, song, difficulty } = props;

  // when switching between single and double, any mod set to a value incompatible
  // with the new mode will be reset to its default value
  useEffect(() => {
    if (mode === "double" && !["off", "mirror"].includes(mods.turn)) {
      updateMods({ turn: "off" });
    }
  }, [mode]);

  const getEffectiveScrollSpeed = () => {
    if (!song) return null;
    let displayBpm = song.displayBpm;
    if (displayBpm.includes(",")) {
      let difficultyIdx = SP_DIFFICULTIES.indexOf(difficulty);
      if (mode === "double") difficultyIdx += 4;
      displayBpm = displayBpm.split(",")[difficultyIdx];
    }

    const [lowBpm, highBpm] = displayBpm.split("-");
    if (!highBpm) {
      return <strong>{Math.round(lowBpm * mods.speed)}</strong>;
    } else {
      return (
        <strong>{`${Math.round(lowBpm * mods.speed)} - ${Math.round(
          highBpm * mods.speed
        )}`}</strong>
      );
    }
  };

  return (
    <div
      className={`view-section modsView ${
        props.activeView === "mods" ? "active" : ""
      }`}
    >
      <div className="view-wrapper">
        <form className="modsForm">
          <div className="form-field">
            <h4 className="form-label">
              Speed
              {song && (
                <span className="effective-scroll-speed">
                  (Effective scroll speed:{" "}
                  <strong>{getEffectiveScrollSpeed()}</strong>)
                </span>
              )}
            </h4>
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
            <h4 className="form-label">Appearance</h4>
            {options.mods.appearance.map((appearance, i) => {
              return (
                <Radio
                  key={`appearance_${appearance}`}
                  label={
                    [
                      "Visible",
                      "Hidden+",
                      "Sudden+",
                      "Hidden+ / Sudden+",
                      "Stealth",
                    ][i]
                  }
                  name="appearance"
                  value={appearance}
                  checked={mods.appearance === appearance}
                  onChange={() => updateMods({ appearance })}
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
            {options.mods.turn
              .filter((turn) => {
                if (mode === "double")
                  return turn === "off" || turn === "mirror";
                return true;
              })
              .map((turn) => {
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

          <div className="form-field">
            <h4 className="form-label">Step zone</h4>
            {options.mods.stepZone.map((stepZone) => {
              return (
                <Radio
                  key={`stepZone_${stepZone}`}
                  label={capitalize(stepZone)}
                  name="stepZone"
                  value={stepZone}
                  checked={mods.stepZone === stepZone}
                  onChange={() => updateMods({ stepZone })}
                />
              );
            })}
          </div>

          <div className="form-field">
            <h4 className="form-label">Scroll</h4>
            {options.mods.scroll.map((scroll) => {
              return (
                <Radio
                  key={`scroll_${scroll}`}
                  label={capitalize(scroll)}
                  name="scroll"
                  value={scroll}
                  checked={mods.scroll === scroll}
                  onChange={() => updateMods({ scroll })}
                />
              );
            })}
          </div>

          <div className="form-field">
            <h4 className="form-label">Combo display</h4>
            {options.mods.comboDisplay.map((comboDisplay, i) => {
              return (
                <Radio
                  key={`comboDisplay_${comboDisplay}`}
                  label={["Behind arrows", "In front of arrows", "Hidden"][i]}
                  name="comboDisplay"
                  value={comboDisplay}
                  checked={mods.comboDisplay === comboDisplay}
                  onChange={() => updateMods({ comboDisplay })}
                />
              );
            })}
          </div>

          <div className="form-field">
            <h4 className="form-label">Combo font</h4>
            {options.mods.comboFont.map((comboFont) => {
              return (
                <Radio
                  key={`comboFont_${comboFont}`}
                  label={comboFont}
                  name="comboFont"
                  value={comboFont}
                  checked={mods.comboFont === comboFont}
                  onChange={() => updateMods({ comboFont })}
                />
              );
            })}
          </div>

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
    </div>
  );
};

const mapStateToProps = (state) => {
  const { mods, songSelect, screen } = state;
  return {
    mods,
    mode: songSelect.mode,
    song: songSelect.song,
    difficulty: songSelect.difficulty,
    activeView: screen.activeView,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updateMods: (mods) => dispatch(updateMods(mods)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ModsForm);
