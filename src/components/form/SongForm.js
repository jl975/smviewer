import React, { useState, useEffect } from "react";
import { Dropdown, Radio, Button } from "semantic-ui-react";

import SongGrid from "./SongGrid";
import { options } from "./options";

const SongForm = (props) => {
  const { activeView, simfileList, selectedDifficulty } = props;

  const simfileOptions = simfileList.map((song) => {
    return { key: song.hash, value: song.hash, text: song.title };
  });

  const [selectedSongOption, setSelectedSongOption] = useState(null);
  const [selectedDifficultyOption, setSelectedDifficultyOption] = useState(
    selectedDifficulty
  );

  // object corresponding to the selected song option
  // NOT the song currently playing in the main view
  const [selectedSong, setSelectedSong] = useState(null);

  // initialize song for testing
  useEffect(() => {
    // onSongSelect(null, { value: "99OQb9b0IQ98P6IQdPOiqi8q16o16iqP" }); // ORCA
    // onSongSelect(null, { value: "PooiIP8qP0IPd9D1Ibi6l9bDoqdi9P8O" }); // DEGRS
    // onSongSelect(null, { value: "q0QIob1PDI6IP86dlPb6I6il9d6bP606" }); // einya
    // onSongSelect(null, { value: "bIlqP91O9ld1lqlq6qoq9OiPdqIDPP0l" }); // lachryma
    // onSongSelect(null, { value: "06O0ObdQobq86lPDo6P18dQ1QPdilIQO" }); // ayakashi
    // onSongSelect(null, { value: "9bI0dQdb01Dl1bQq1Pq998i0l096D99P" }); // second heaven
    // onSongSelect(null, { value: "8o1iQPiId8P6Db9Iqo1Oo119QDoq8qQ8" }); // chaos
    // onSongSelect(null, { value: "dD6PqbboDil89DPIID86Pldi6obI1b8l" }); // pluto
    // onSongSelect(null, { value: "loP08P1PPi990lPD0O060d888O9o6qb8" }); // seasons
    // onSongSelect(null, { value: "8QbqP80q9PI8bbi0qOoiibOQD08OPdli" }); // felm
    // onSongSelect(null, { value: "6bid6d9qPQ80DOqiidQQ891o6Od8801l" }); // otp
    // onSongSelect(null, { value: "9i0q91lPPiO61b9P891O1i86iOP1I08O" }); // egoism
    // onSongSelect(null, { value: "lldPQPDP0qq8iqQ910l8b8PoQ6O668Q0" }); // downer & upper
    // onSongSelect(null, { value: "PP1q0iii1D6Dq9QOd0qqDOQD0160QoPD" }); // paranoia eternal
    // onSongSelect(null, { value: "QI06q9lPIoo80DlI18Ooi6dbPl89bqi0" }); // our soul
    // onSongSelect(null, { value: "POq8OPlOO9199i11Od0P00801Qo01DQo" }); // rtswy
    // onSongSelect(null, { value: "QQldo10ObPPQPlliODiDIIl0Q1oPoo61" }); // deltamax
    // onSongSelect(null, { value: "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI" }); // paranoia
    // onSongSelect(null, { value: "0dOi10q9Q6oi0Q9960iQQDO6olqlDDqo" }); // private eye
    onSongSelect(null, { value: "9I00D9Id61iD6QP8i8Dd6698PoQ9bdi9" }); // okome

    // onDifficultySelect(null, "Expert");
    // setTimeout(() => {
    //   handleSubmit({ preventDefault: () => {} });
    // });
  }, []);

  useEffect(() => {
    if (selectedSongOption) {
      const song = simfileList.find((song) => song.hash === selectedSongOption);
      setSelectedSong(song);
    }
  }, [selectedSongOption]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("selectedSongOption", selectedSongOption);

    props.onSongSelect(selectedSong);
    props.onDifficultySelect(selectedDifficultyOption);
  };

  const onSongSelect = (e, data) => {
    const songHash = data.value;
    setSelectedSongOption(songHash);

    // const song = simfileList.find((song) => song.hash === songHash);
    // props.onSongSelect(song);
  };

  const onDifficultySelect = (e, data) => {
    const difficulty = data.value;
    setSelectedDifficultyOption(difficulty);
    // props.onDifficultySelect(difficulty);
  };

  return (
    <div
      className={`form-container songView ${
        activeView === "song" ? "open" : "closed"
      }`}
    >
      <form className="songForm" onSubmit={handleSubmit}>
        <div className="form-inner-wrapper">
          <div className="selectedSong">
            <div className="selectedSong-jacket-wrapper">
              <img
                className="selectedSong-jacket"
                src={`/jackets/${selectedSongOption}.png`}
                alt="Selected song"
              />
            </div>
            <div className="selectedSong-info">
              {/* <h4 className="form-label">Song</h4> */}
              <Dropdown
                placeholder="Choose a song"
                className="song-title-dropdown"
                search
                selection
                value={selectedSongOption}
                onChange={onSongSelect}
                options={simfileOptions}
              />
              <div className="song-artist">
                {selectedSong && selectedSong.artist}
              </div>
            </div>
          </div>

          <div className="form-field">
            <h4 className="form-label">Difficulty</h4>
            {options.difficulty.map((difficulty) => {
              return (
                <Radio
                  key={`difficulty_${difficulty}`}
                  label={difficulty}
                  name="difficulty"
                  value={selectedDifficultyOption}
                  checked={selectedDifficultyOption === difficulty}
                  onChange={onDifficultySelect}
                />
              );
            })}
          </div>
        </div>
        <Button type="submit">Submit</Button>
      </form>

      <SongGrid
        simfileList={simfileList}
        onSongSelect={onSongSelect}
        selectedSong={selectedSongOption}
      />
    </div>
  );
};

export default SongForm;
