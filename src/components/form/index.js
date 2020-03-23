import React, { useState, useEffect } from "react";
import { Dropdown, Radio } from "semantic-ui-react";

import { options } from "./options";
import { capitalize } from "../../utils";

const MusicListForm = props => {
  const { simfileList, selectedDifficulty, mods, setMods } = props;
  // console.log("MusicListForm simfileList", simfileList);

  const simfileOptions = simfileList.map(song => {
    return { key: song.hash, value: song.hash, text: song.title };
  });

  const [selectedSongOption, setSelectedSongOption] = useState(null);

  //temp
  useEffect(() => {
    // onSongSelect(null, { value: "99OQb9b0IQ98P6IQdPOiqi8q16o16iqP" }); // ORCA

    // onSongSelect(null, { value: "PooiIP8qP0IPd9D1Ibi6l9bDoqdi9P8O" }); // DEGRS

    // onSongSelect(null, { value: "q0QIob1PDI6IP86dlPb6I6il9d6bP606" }); // einya

    // onSongSelect(null, { value: "bIlqP91O9ld1lqlq6qoq9OiPdqIDPP0l" }); // lachryma

    // onSongSelect(null, { value: "06O0ObdQobq86lPDo6P18dQ1QPdilIQO" }); // ayakashi

    onSongSelect(null, { value: "9bI0dQdb01Dl1bQq1Pq998i0l096D99P" }); // second heaven
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
  };

  // const togglePlay = () => {
  //   if (!currentAudio) return;
  //   if (currentAudio.paused) currentAudio.play();
  //   else currentAudio.pause();
  // };

  const onSongSelect = (e, data) => {
    const songHash = data.value;
    setSelectedSongOption(songHash);

    const song = simfileList.find(song => song.hash === songHash);
    props.onSongSelect(song);
  };

  const onDifficultySelect = (e, data) => {
    const difficulty = data.value;
    props.onDifficultySelect(difficulty);
  };

  const updateMods = updatedMods => {
    setMods({ ...mods, ...updatedMods });
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <h4 className="form-label">Song</h4>
          <Dropdown
            placeholder="Choose a song"
            search
            selection
            value={selectedSongOption}
            onChange={onSongSelect}
            options={simfileOptions}
          />
        </div>
        <div className="form-field">
          <h4 className="form-label">Difficulty</h4>
          {options.difficulty.map(difficulty => {
            return (
              <Radio
                key={`difficulty_${difficulty}`}
                label={difficulty}
                name="difficulty"
                value={difficulty}
                checked={selectedDifficulty === difficulty}
                onChange={onDifficultySelect}
              />
            );
          })}
        </div>

        <br />
        <br />
        <div className="form-field">
          <h4 className="form-label">Speed</h4>
          {options.mods.speed.map(speed => {
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
          {options.mods.noteskin.map(noteskin => {
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
          {options.mods.turn.map(turn => {
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
            {options.mods.shuffle.map(shuffle => {
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
      </form>
    </div>
  );
};

export default MusicListForm;
