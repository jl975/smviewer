import React, { useState, useEffect } from "react";
import { Dropdown, Radio, Button } from "semantic-ui-react";
import { connect } from "react-redux";

import SongGrid from "./SongGrid";
import { options } from "./options";
import { getJacketPath } from "../../utils";
import {
  SP_DIFFICULTIES,
  TITLE_CATEGORIES,
  LEVELS,
  DDR_VERSIONS,
} from "../../constants";
import AudioPlayer from "../../core/AudioPlayer";
import { ReactComponent as AudioWave } from "../../svg/audiowave.svg";

const SongForm = (props) => {
  const {
    activeView,
    setActiveView,
    simfileList,
    selectedDifficulty,
    loadingAudio,
    previewAudio,
  } = props;

  const simfileOptions = simfileList.map((song) => {
    return { key: song.hash, value: song.hash, text: song.title };
  });

  const [selectedSongOption, setSelectedSongOption] = useState(null);
  const [selectedDifficultyOption, setSelectedDifficultyOption] = useState(
    selectedDifficulty
  );

  const [selectedFilters, setSelectedFilters] = useState({
    title: "all",
    version: 16,
    level: "all",
    // level: 10,
  });

  const [displayedSongs, setDisplayedSongs] = useState([]);

  useEffect(() => {
    const { title, version, level } = selectedFilters;

    const songs = simfileList.filter((song) => {
      return (
        (title === "all" || title === song.abcSort) &&
        (version === "all" || version === parseInt(song.version)) &&
        (level === "all" || song.levels.slice(0, 5).includes(level))
      );
    });

    setDisplayedSongs(songs);
  }, [selectedFilters]);

  // object corresponding to the selected song option
  // NOT the song currently playing in the main view
  const [selectedSong, setSelectedSong] = useState(null);

  const titleSortOptions = [
    { key: "title_all", value: "all", text: "ALL" },
  ].concat(
    TITLE_CATEGORIES.map((letter) => {
      return { key: `title_${letter}`, value: letter, text: letter };
    })
  );

  const versionSortOptions = [
    { key: "version_all", value: "all", text: "ALL" },
  ].concat(
    DDR_VERSIONS.map((versionName, idx) => {
      return { key: `version_${idx}`, value: idx, text: versionName };
    }).reverse()
  );

  const levelSortOptions = [
    { key: "level_all", value: "all", text: "ALL" },
  ].concat(
    LEVELS.map((level) => {
      return { key: `level_${level}`, value: level, text: level };
    })
  );

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
    onSongSelect(null, { value: "QQldo10ObPPQPlliODiDIIl0Q1oPoo61" }); // deltamax
    // onSongSelect(null, { value: "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI" }); // paranoia
    // onSongSelect(null, { value: "0dOi10q9Q6oi0Q9960iQQDO6olqlDDqo" }); // private eye
    // onSongSelect(null, { value: "9I00D9Id61iD6QP8i8Dd6698PoQ9bdi9" }); // okome
    // onSongSelect(null, { value: "O9qDQOQO8dDDIiO9dPP0Pb8qQo9l89D9" }); // triperfect
    // onSongSelect(null, { value: "0IldoDlDQql99DqQo0Qq9ioPIiiPoIoi" }); // pluto relinquish

    // onDifficultySelect(null, "Expert");
    // setTimeout(() => {
    //   handleSubmit({ preventDefault: () => {} });
    // });
  }, []);

  useEffect(() => {
    if (selectedSongOption) {
      const song = simfileList.find((song) => song.hash === selectedSongOption);
      setSelectedSong(song);
      AudioPlayer.storeAudioSource(song);
    }
  }, [selectedSongOption]);

  const onSongSelect = async (e, data) => {
    const songHash = data.value;
    setSelectedSongOption(songHash);

    console.log("setSelectedSongOption", songHash);
    AudioPlayer.stopSongPreview();

    const song = simfileList.find((song) => song.hash === songHash);

    // if a specific level filter has been chosen, select the difficulty that
    // corresponds to that level
    console.log("selectedFilters.level", selectedFilters.level);
    if (selectedFilters.level) {
      for (let i = 0; i < song.levels.length; i++) {
        const level = song.levels[i];
        if (level === selectedFilters.level) {
          console.log("match", SP_DIFFICULTIES[i], level);
          handleDifficultySelect(SP_DIFFICULTIES[i]);
          break;
        }
      }
    } else {
      props.onDifficultySelect(selectedDifficultyOption);
    }

    // automatically update chart
    props.onSongSelect(song);
  };

  // deprecated, used with semantic ui radio
  const onDifficultySelect = (e, data) => {
    const difficulty = data.value;
    setSelectedDifficultyOption(difficulty);
    // props.onDifficultySelect(difficulty);
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficultyOption(difficulty);
    props.onDifficultySelect(difficulty);
  };

  const renderDifficulties = () => {
    if (!selectedSong) return null;

    // temp: only single
    return selectedSong.levels.slice(0, 5).map((level, idx) => {
      if (!level) return null;
      const difficulty = SP_DIFFICULTIES[idx];
      return (
        <div
          className={`song-difficulty ${difficulty} ${
            selectedDifficultyOption === difficulty ? "selected" : ""
          }`}
          key={`sp-difficulty_${difficulty}`}
          onClick={() => handleDifficultySelect(difficulty)}
        >
          <div className="difficulty">{difficulty}</div>
          <div className="level">{level}</div>
        </div>
      );
    });
  };

  const toggleSongPreview = () => {
    const oldSongHash = AudioPlayer.currentPreview;

    // toggle start/stop of the same song
    if (oldSongHash === selectedSong.hash) {
      if (previewAudio.status === "playing") {
        AudioPlayer.stopSongPreview();
      } else {
        AudioPlayer.playSongPreview(selectedSong);
      }
    }

    // play a new song and stop the current one (if applicable)
    else {
      if (previewAudio.status === "playing") {
        AudioPlayer.stopSongPreview();
      }
      AudioPlayer.playSongPreview(selectedSong);
    }
  };

  return (
    <div
      className={`form-container songView ${
        activeView === "song" ? "open" : "closed"
      }`}
    >
      <form className="songForm">
        <div className="form-inner-wrapper">
          <div className="selectedSong">
            <div
              className={`selectedSong-jacket-wrapper ${
                previewAudio.status === "playing" ? "playing" : ""
              }`}
            >
              <div className="selectedSong-jacket-overlay">
                <AudioWave />
              </div>
              <img
                className={`selectedSong-jacket`}
                src={getJacketPath(`${selectedSongOption}.png`)}
                alt="Selected song"
                onClick={toggleSongPreview}
              />
            </div>
            <div className="selectedSong-info">
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

              <div className="song-difficulties">{renderDifficulties()}</div>
            </div>
          </div>
          <div className="songForm-filters">
            <div className="form-field">
              <label>By Title</label>
              <Dropdown
                className="title-filter-dropdown"
                selection
                value={selectedFilters.title}
                onChange={(e, data) =>
                  setSelectedFilters({ ...selectedFilters, title: data.value })
                }
                options={titleSortOptions}
              />
            </div>
            <div className="form-field">
              <label>By Version</label>
              <Dropdown
                className="version-filter-dropdown"
                selection
                value={selectedFilters.version}
                onChange={(e, data) =>
                  setSelectedFilters({
                    ...selectedFilters,
                    version: data.value,
                  })
                }
                options={versionSortOptions}
              />
            </div>
            <div className="form-field">
              <label>By Level</label>
              <Dropdown
                className="level-filter-dropdown"
                selection
                value={selectedFilters.level}
                onChange={(e, data) =>
                  setSelectedFilters({ ...selectedFilters, level: data.value })
                }
                options={levelSortOptions}
              />
            </div>
          </div>

          {/* <div className="songForm-actions">
            <Button type="submit" className="submit-btn">
              SELECT
            </Button>
          </div> */}
        </div>
      </form>

      <SongGrid
        displayedSongs={displayedSongs}
        onSongSelect={onSongSelect}
        selectedSongOption={selectedSongOption}
      />
    </div>
  );
};

const mapStateToProps = (state) => {
  const { audio } = state;
  const { previewAudio } = audio;
  return {
    previewAudio,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(SongForm);
