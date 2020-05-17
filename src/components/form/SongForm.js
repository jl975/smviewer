import React, { useState, useEffect, useRef } from "react";
import { Dropdown } from "semantic-ui-react";
import { connect } from "react-redux";

import * as actions from "../../actions/SongSelectActions";
import SongGrid from "./SongGrid";
import { getJacketPath, presetParams } from "../../utils";
import { getClosestDifficulty } from "../../utils/songUtils";
import {
  getUserSettings,
  updateUserSettings,
  getSavedSongProgress,
} from "../../utils/userSettings";
import loadStore from "../../utils/loadStore";
import ToggleSwitch from "../ui/ToggleSwitch";
import { SP_DIFFICULTIES, DP_DIFFICULTIES } from "../../constants";
import {
  titleSortOptions,
  versionSortOptions,
  levelSortOptions,
  difficultySortOptions,
} from "./songFormOptions";
import AudioPlayer from "../../core/AudioPlayer";
import { ReactComponent as AudioWave } from "../../svg/audiowave.svg";

const userSettings = getUserSettings();

const SongForm = (props) => {
  const { simfileList, selectedDifficulty, selectedMode, previewAudio } = props;
  const songGridContainer = useRef();

  const simfileOptions = simfileList.map((song) => {
    return { key: song.hash, value: song.hash, text: song.title };
  });

  const [selectedSongOption, setSelectedSongOption] = useState(null);
  const [selectedDifficultyOption, setSelectedDifficultyOption] = useState(
    selectedDifficulty
  );

  const [selectedFilters, setSelectedFilters] = useState(
    userSettings.filters || {
      title: "all",
      version: 15,
      level: "all",
      difficulty: "all",
      // level: 10,
    }
  );

  const updateSelectedFilters = (newFilters) => {
    const filters = { ...selectedFilters, ...newFilters };
    updateUserSettings({ filters });
    setSelectedFilters(filters);
  };

  const [displayedSongs, setDisplayedSongs] = useState([]);

  // on filter or mode change
  useEffect(() => {
    const { title, version, level, difficulty } = selectedFilters;

    const songs = simfileList
      .filter((song) => {
        const singleDiffs = song.levels.slice(0, 5);
        const doubleDiffs = song.levels.slice(5, 9);
        return (
          // song matches title filter
          (title === "all" || title === song.abcSort) &&
          // song matches version filter
          (version === "all" || version === parseInt(song.version)) &&
          // if a level filter is selected, song matches level filter
          // if level is not being filtered, song has at least one chart on the chosen mode
          ((level === "all" &&
            selectedMode === "single" &&
            singleDiffs.some((level) => !!level)) ||
            (level === "all" &&
              selectedMode === "double" &&
              doubleDiffs.some((level) => !!level)) ||
            (selectedMode === "single" &&
              song.levels.slice(0, 5).includes(level)) ||
            (selectedMode === "double" &&
              song.levels.slice(5, 9).includes(level)))
        );
      })
      .filter((song) => {
        // if a difficulty is specified:
        if (difficulty !== "all") {
          // if level is not specified, simply check if that difficulty exists
          if (level === "all") {
            if (selectedMode === "single") {
              return song.levels[SP_DIFFICULTIES.indexOf(difficulty)] !== null;
            } else if (selectedMode === "double") {
              return (
                song.levels[DP_DIFFICULTIES.indexOf(difficulty) + 5] !== null
              );
            }
          }
          // if level is specified, only show if the difficulty is that level
          else {
            if (selectedMode === "single") {
              return song.levels[SP_DIFFICULTIES.indexOf(difficulty)] === level;
            } else if (selectedMode === "double") {
              return (
                song.levels[DP_DIFFICULTIES.indexOf(difficulty) + 5] === level
              );
            }
          }
        }
        return song;
      });

    setDisplayedSongs(songs);
    songGridContainer.current.scrollTop = 0;
  }, [selectedFilters, selectedMode]);

  // object corresponding to the selected song option
  // NOT the song currently playing in the main view
  const [selectedSong, setSelectedSong] = useState(null);

  // initialize song for testing
  useEffect(() => {
    /*
      For some reason, the very first interaction with the dom will reset the Howler
      audio seek time to 0 (a bug?). Force an interaction in the beginning to get this
      out of the way and prevent overwriting of the preset time
    */
    document.body.click();

    if (presetParams.song) {
      onSongSelect(null, { value: presetParams.song });
    } else if (userSettings.song) {
      onSongSelect(null, { value: userSettings.song });
    } else {
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
      // onSongSelect(null, { value: "9I00D9Id61iD6QP8i8Dd6698PoQ9bdi9" }); // okome
      // onSongSelect(null, { value: "O9qDQOQO8dDDIiO9dPP0Pb8qQo9l89D9" }); // triperfect
      // onSongSelect(null, { value: "0IldoDlDQql99DqQo0Qq9ioPIiiPoIoi" }); // pluto relinquish
      // onSongSelect(null, { value: "PIO8dod8P9OOP1bi0D1POIi6OdOdQDql" }); // pluto the first
      // onSongSelect(null, { value: "8O6b1D9PDO0ll1IO9d1ODDPPo0QPQbob" }); // tme
      // onSongSelect(null, { value: "ld6P1lbb0bPO9doqbbPOoPb8qoDo8id0" }); // A4A
      // onSongSelect(null, { value: "O06Id8PIDbDblO109ddi1dldd0bqDdQ1" }); // sexy planet from nonstop
      // onSongSelect(null, { value: "IQqOIb6ob8bIbOII66ID0oIQDPl6bdbb" }); // pyfim jazzy groove
      onSongSelect(null, { value: "08QP8bOQ6OOdd11Dq81db1l8IdiDbod6" }); // lesson by dj
    }
  }, []);

  useEffect(() => {
    if (selectedSongOption) {
      const song = simfileList.find((song) => song.hash === selectedSongOption);
      setSelectedSong(song);
      AudioPlayer.storeAudioSource(song);
    }
  }, [selectedSongOption]);

  const onSongSelect = async (_, data) => {
    AudioPlayer.stopSongPreview();
    if (selectedSong) {
      AudioPlayer.killImmediately(selectedSong.hash);
    }

    const songHash = data.value;
    setSelectedSongOption(songHash);

    // console.log("setSelectedSongOption", songHash);

    const song = simfileList.find((song) => song.hash === songHash);

    let initialProgress = 0;

    // initialize progress only if this is the song being initialized on page load
    if (!props.previousSong) {
      initialProgress = getSavedSongProgress();
    }

    if (presetParams.song === songHash && presetParams.progress) {
      initialProgress = presetParams.progress / 100000;
    } else {
      // remove preset progress marker if it is no longer relevant to the new song
      presetParams.progress = 0;
    }

    // automatically fetch simfile and update chart
    await props.onSongSelect(song, initialProgress);

    // short-circuit if this is not the last song that was selected
    if (loadStore.lastRequestedSong !== song.title) {
      return;
    }

    // if a specific level filter has been chosen, select the difficulty that
    // corresponds to that level
    if (selectedFilters.difficulty !== "all") {
      handleDifficultySelect(selectedFilters.difficulty);
    } else if (selectedFilters.level !== "all") {
      const levels =
        selectedMode === "double"
          ? song.levels.slice(5, 9)
          : song.levels.slice(0, 5);
      for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        if (level === selectedFilters.level) {
          const difficulties =
            selectedMode === "double" ? DP_DIFFICULTIES : SP_DIFFICULTIES;
          console.log("match", difficulties[i], level);
          handleDifficultySelect(difficulties[i]);
          break;
        }
      }
    } else {
      const selectedDiffOptionIndex = SP_DIFFICULTIES.indexOf(
        selectedDifficultyOption
      );
      let difficultyToSelect;
      if (song.levels[selectedDiffOptionIndex]) {
        difficultyToSelect = selectedDifficultyOption;
      } else {
        difficultyToSelect = getClosestDifficulty(
          song,
          selectedDifficultyOption,
          selectedMode
        );
      }
      props.onDifficultySelect(difficultyToSelect);
    }
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficultyOption(difficulty);
    props.onDifficultySelect(difficulty);
  };

  const handleModeSelect = (mode) => {
    props.onModeSelect(mode);
  };

  const renderDifficulties = () => {
    if (!selectedSong) return null;

    let levels;
    if (selectedMode === "single") levels = selectedSong.levels.slice(0, 5);
    else if (selectedMode === "double")
      levels = selectedSong.levels.slice(5, 9);

    return levels.map((level, idx) => {
      if (!level) return null;
      const difficulty =
        selectedMode === "double" ? DP_DIFFICULTIES[idx] : SP_DIFFICULTIES[idx];
      return (
        <div
          className={`song-difficulty ${difficulty} ${
            selectedDifficulty === difficulty ? "selected" : ""
          }`}
          key={`${selectedMode}-difficulty_${difficulty}`}
          onClick={() => handleDifficultySelect(difficulty)}
        >
          <div className="difficulty">{difficulty}</div>
          <div className="level">{level}</div>
        </div>
      );
    });
  };

  const getDisplayBpm = () => {
    if (!selectedSong) return null;
    let displayBpm = selectedSong.displayBpm;
    if (displayBpm.includes(",")) {
      let difficultyIdx = SP_DIFFICULTIES.indexOf(selectedDifficulty);
      if (selectedMode === "double") difficultyIdx += 4;
      displayBpm = displayBpm.split(",")[difficultyIdx];
    }
    return displayBpm;
  };

  const isModeToggleDisabled = () => {
    if (!selectedSong || !selectedMode) return true;
    if (selectedDifficulty === "Beginner") return true;
    if (selectedMode === "single") {
      return !selectedSong.levels.slice(5, 9).filter((a) => a).length;
    } else if (selectedMode === "double") {
      return !selectedSong.levels.slice(0, 5).filter((a) => a).length;
    }
    return true;
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
      className={`view-section songView ${
        props.activeView === "song" ? "active" : ""
      }`}
    >
      <div className="view-wrapper">
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
                  selectOnBlur={false}
                  selectOnNavigation={false}
                />
                <div className="song-artist">
                  {selectedSong && selectedSong.artist}
                </div>

                <div className="song-difficulties">{renderDifficulties()}</div>

                <div className="song-mode">
                  <ToggleSwitch
                    option1={{ text: "Single", value: "single" }}
                    option2={{ text: "Double", value: "double" }}
                    onChange={handleModeSelect}
                    value={selectedMode}
                    disabled={isModeToggleDisabled()}
                  />
                </div>

                <div className="bpm-display-container">
                  <div className="bpm-display-label">BPM</div>
                  <div className="bpm-display-value">{getDisplayBpm()}</div>
                </div>
              </div>
            </div>
            <div className="songForm-filters">
              <div className="songForm-filters-row">
                <div className="form-field">
                  <label>By Title</label>
                  <Dropdown
                    className="title-filter-dropdown"
                    selection
                    value={selectedFilters.title}
                    onChange={(e, data) =>
                      updateSelectedFilters({
                        title: data.value,
                      })
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
                      updateSelectedFilters({
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
                      updateSelectedFilters({
                        level: data.value,
                      })
                    }
                    options={levelSortOptions}
                  />
                  <label>By Difficulty</label>
                  <Dropdown
                    className="difficulty-filter-dropdown"
                    selection
                    value={selectedFilters.difficulty}
                    onChange={(e, data) =>
                      updateSelectedFilters({
                        difficulty: data.value,
                      })
                    }
                    options={difficultySortOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="songGrid-container" ref={songGridContainer}>
          <SongGrid
            displayedSongs={displayedSongs}
            onSongSelect={onSongSelect}
            selectedSongOption={selectedSongOption}
            selectedMode={selectedMode}
            // selectedDifficulty={selectedDifficulty}
            selectedDifficultyOption={selectedDifficultyOption}
            selectedFilters={selectedFilters}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { audio, songSelect, screen } = state;
  const { previewAudio } = audio;
  return {
    previewAudio,
    selectedDifficulty: songSelect.difficulty,
    selectedMode: songSelect.mode,
    previousSong: songSelect.song,
    activeView: screen.activeView,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    selectSong: (song) => dispatch(actions.selectSong(song)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SongForm);
