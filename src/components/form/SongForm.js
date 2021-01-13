import React, { useState, useEffect, useRef } from "react";
import { Dropdown } from "semantic-ui-react";
import { connect } from "react-redux";

import * as actions from "../../actions/SongSelectActions";
import SongSearch from "./SongSearch";
import SongGrid from "./SongGrid";
import { getJacketPath, presetParams } from "../../utils";
import { getClosestDifficulty, isInBpmRange } from "../../utils/songUtils";
import { clearBpmAndStopDisplay } from "../../utils/engineUtils";
import { getUserSettings, updateUserSettings, getSavedSongProgress } from "../../utils/userSettings";
import loadStore from "../../utils/loadStore";
import ToggleSwitch from "../ui/ToggleSwitch";
import { SP_DIFFICULTIES, DP_DIFFICULTIES } from "../../constants";
import {
  titleSortOptions,
  versionSortOptions,
  levelSortOptions,
  difficultySortOptions,
  bpmRangeOptions,
} from "./songFormOptions";
import AudioPlayer from "../../core/AudioPlayer";
import { ReactComponent as AudioWave } from "../../svg/audiowave.svg";

const SongForm = (props) => {
  const { simfileList, selectedDifficulty, selectedMode, previewAudio } = props;
  const userSettings = getUserSettings();
  const songGridContainer = useRef();

  const simfileOptions = simfileList.map((song) => {
    return {
      key: song.hash,
      value: song.hash,
      text: song.title,
      description: song.smName,
    };
  });

  const [selectedSongOption, setSelectedSongOption] = useState("");
  const [selectedDifficultyOption, setSelectedDifficultyOption] = useState(selectedDifficulty);
  // const [loadingFirstSong, setLoadingFirstSong] = useState(true);

  const [selectedFilters, setSelectedFilters] = useState(
    userSettings.filters || {
      title: "all",
      version: 16,
      level: "all",
      difficulty: "all",
      bpm: "all",
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
    const { title, version, level, difficulty, bpm } = selectedFilters;

    const songs = simfileList
      .filter((song) => {
        const singleDiffs = song.levels.slice(0, 5);
        const doubleDiffs = song.levels.slice(5, 9);
        return (
          // song matches title filter
          (title === "all" || title === song.abcSort) &&
          // song matches version filter
          (version === "all" || version === parseInt(song.version)) &&
          // song matches bpm range filter
          (bpm === "all" || isInBpmRange(song, bpm, difficulty)) &&
          // if a level filter is selected, song matches level filter
          // if level is not being filtered, song has at least one chart on the chosen mode
          ((level === "all" && selectedMode === "single" && singleDiffs.some((level) => !!level)) ||
            (level === "all" && selectedMode === "double" && doubleDiffs.some((level) => !!level)) ||
            (selectedMode === "single" && song.levels.slice(0, 5).includes(level)) ||
            (selectedMode === "double" && song.levels.slice(5, 9).includes(level)))
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
              return song.levels[DP_DIFFICULTIES.indexOf(difficulty) + 5] !== null;
            }
          }
          // if level is specified, only show if the difficulty is that level
          else {
            if (selectedMode === "single") {
              return song.levels[SP_DIFFICULTIES.indexOf(difficulty)] === level;
            } else if (selectedMode === "double") {
              return song.levels[DP_DIFFICULTIES.indexOf(difficulty) + 5] === level;
            }
          }
        }
        return song;
      })
      .sort((songA, songB) => {
        // only do bpm sort for now. default is title game order
        if (bpm !== "all") {
          const aBpms = songA.displayBpm.split("-");
          const aMaxBpm = parseInt(aBpms[aBpms.length - 1]);
          const bBpms = songB.displayBpm.split("-");
          const bMaxBpm = parseInt(bBpms[bBpms.length - 1]);
          if (aMaxBpm > bMaxBpm) return 1;
          if (aMaxBpm < bMaxBpm) return -1;
          return 0;
        }

        // assume stable sort keeps the default order
        return 0;
      });

    setDisplayedSongs(songs);
    songGridContainer.current.scrollTop = 0;
  }, [selectedFilters, selectedMode]);

  // object corresponding to the selected song option
  // NOT the song currently playing in the main view
  const [selectedSong, setSelectedSong] = useState(null);

  // // respond to changes in share link url params
  // useEffect(() => {
  //   if (loadingFirstSong) return;
  //   try {
  //     console.log("share link params:", props.location.search);
  //     const parsedParams = parseUrlParams();
  //     console.log("parsedParams", parsedParams);
  //     const initialValues = generateInitialValues(parsedParams);
  //     console.log("initialValues", initialValues);
  //     onSongSelect(parsedParams.song, { preserveShareUrl: true });
  //   } catch (error) {
  //     console.log("error while trying to respond to url param change");
  //   }
  // }, [props.location]);

  // initialize song for testing
  useEffect(() => {
    /*
      For some reason, the very first interaction with the dom will reset the Howler
      audio seek time to 0 (a bug?). Force an interaction in the beginning to get this
      out of the way and prevent overwriting of the preset time
    */
    setTimeout(() => {
      document.body.click();
    });
    // Select a pre-selected song
    // Highest priority: song contained in share url
    if (presetParams.song) {
      onSongSelect(presetParams.song, { preserveShareUrl: true });
    }
    // Second highest priority: song saved from user's previous session
    else if (userSettings.song) {
      onSongSelect(userSettings.song, { difficulty: userSettings.difficulty });
    }
    // Lowest priority: arbitrary song chosen to be the default
    else {
      onSongSelect("99OQb9b0IQ98P6IQdPOiqi8q16o16iqP"); // ORCA
    }
    // setLoadingFirstSong(false);
  }, []);

  useEffect(() => {
    if (selectedSongOption) {
      const song = simfileList.find((song) => song.hash === selectedSongOption);
      setSelectedSong(song);
    }
  }, [selectedSongOption]);

  const selectClosestDifficulty = (song, mode = selectedMode) => {
    let selectedDiffOptionIndex = SP_DIFFICULTIES.indexOf(selectedDifficultyOption);
    if (mode === "double") selectedDiffOptionIndex += 4;
    let difficultyToSelect;
    if (song.levels[selectedDiffOptionIndex] && !song.missingDifficulties.includes(selectedDiffOptionIndex)) {
      difficultyToSelect = selectedDifficultyOption;
    } else {
      difficultyToSelect = getClosestDifficulty(song, selectedDifficultyOption, mode);
    }
    props.onDifficultySelect(difficultyToSelect);
  };

  const onSongSelect = async (songId, params = {}) => {
    AudioPlayer.stopSongPreview();
    if (selectedSong) {
      AudioPlayer.killImmediately(selectedSong.hash);
      clearBpmAndStopDisplay();
    }

    setSelectedSongOption(songId);

    const song = simfileList.find((song) => song.hash === songId);

    let initialProgress = 0;

    // initialize progress only if this is the song being initialized on page load
    // or if the previous song is the same as the current song (e.g. came from different route)
    if (!props.previousSong || props.previousSong.hash === songId) {
      initialProgress = getSavedSongProgress();
    }

    if (presetParams.song === songId && presetParams.progress) {
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

    // If difficulty is specified, select this difficulty
    if (params.difficulty) {
      props.onDifficultySelect(params.difficulty);
    }

    // Otherwise, auto-select the selected song's chart based on the applied level/difficulty filters.
    // Ignore if the previous song is the same as the selected song.
    else if (!(props.previousSong && props.previousSong.hash === songId)) {
      // short-circuit if difficulty is specified

      // 4 possible cases of filter combinations

      // Neither level nor difficulty filter applied
      if (selectedFilters.level === "all" && selectedFilters.difficulty === "all") {
        // select the chart corresponding to the selected difficulty option.
        // if the song does not have a chart for that difficulty, choose the closest difficulty.
        selectClosestDifficulty(song);
      }

      // Level filter applied but not difficulty
      else if (selectedFilters.level !== "all" && selectedFilters.difficulty === "all") {
        const levels = selectedMode === "double" ? song.levels.slice(5, 9) : song.levels.slice(0, 5);

        // if the song has a chart that matches the level filter, choose that chart
        if (levels.includes(selectedFilters.level)) {
          for (let i = 0; i < levels.length; i++) {
            const level = levels[i];
            if (level === selectedFilters.level) {
              const difficulties = selectedMode === "double" ? DP_DIFFICULTIES : SP_DIFFICULTIES;
              props.onDifficultySelect(difficulties[i]);
              break;
            }
          }
        }

        // if the song does not have a chart that matches the level filter, go with the closest difficulty
        else {
          selectClosestDifficulty(song);
        }
      }

      // Difficulty filter applied but not level
      else if (selectedFilters.difficulty !== "all" && selectedFilters.level === "all") {
        let difficultyIdx = SP_DIFFICULTIES.indexOf(selectedFilters.difficulty);
        if (selectedMode === "double") difficultyIdx += 4;

        // if the song has a chart that matches the difficulty filter, choose that chart
        if (typeof song.levels[difficultyIdx] === "number") {
          props.onDifficultySelect(selectedFilters.difficulty);
        }

        // if the song does not have a chart that matches the difficulty filter, go with the closest difficulty
        else {
          selectClosestDifficulty(song);
        }
      }

      // Both level and difficulty filters applied
      // equivalent to a regular else block but condition listed explicitly for clarity
      else if (selectedFilters.difficulty !== "all" && selectedFilters.level !== "all") {
        let difficultyIdx = SP_DIFFICULTIES.indexOf(selectedFilters.difficulty);
        if (selectedMode === "double") difficultyIdx += 4;

        if (song.levels[difficultyIdx] === selectedFilters.level) {
          props.onDifficultySelect(selectedFilters.difficulty);
        } else {
          selectClosestDifficulty(song);
        }
      }
    }

    /* Miscellaneous side effects of selecting a song */

    // if the user got here via a share url and changes the song/difficulty, remove the share params
    if (!params.preserveShareUrl) {
      window.history.pushState(null, null, ".");
    }
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficultyOption(difficulty);
    props.onDifficultySelect(difficulty);
  };

  const handleModeSelect = (mode) => {
    if (!isChartAvailable(selectedSong, mode)) {
      selectClosestDifficulty(selectedSong, mode);
    }
    props.onModeSelect(mode);
  };

  const renderDifficulties = () => {
    if (!selectedSong) return null;

    // For newly released songs, not all difficulties may have their simfiles available at the time.
    // Gray out all difficulties that are not available
    let availableSimfiles = {};

    if (props.gameEngine && props.gameEngine.simfiles) {
      availableSimfiles = props.gameEngine.simfiles;
    }
    // console.log("renderDifficulties availableSimfiles", availableSimfiles);

    let levels;
    if (selectedMode === "single") levels = selectedSong.levels.slice(0, 5);
    else if (selectedMode === "double") levels = selectedSong.levels.slice(5, 9);

    return levels.map((level, idx) => {
      if (!level) return null;
      const difficulty = selectedMode === "double" ? DP_DIFFICULTIES[idx] : SP_DIFFICULTIES[idx];

      const isSimfileAvailable = availableSimfiles.hasOwnProperty(`${selectedMode}_${difficulty}`);

      return (
        <div
          className={`song-difficulty ${difficulty} ${selectedDifficulty === difficulty ? "selected" : ""} ${
            isSimfileAvailable ? "" : "unavailable"
          }`}
          key={`${selectedMode}-difficulty_${difficulty}`}
          onClick={() => handleDifficultySelect(difficulty)}
          title={isSimfileAvailable ? null : "Chart currently unavailable."}
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

  const isChartAvailable = (song, mode = selectedMode) => {
    let difficultyIdx = SP_DIFFICULTIES.indexOf(selectedDifficultyOption);
    if (mode === "double") difficultyIdx += 4;
    return !song.missingDifficulties.includes(difficultyIdx);
  };

  const toggleSongPreview = () => {
    console.log("click jacket");
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
    <div className={`view-section songView ${props.activeView === "song" ? "active" : ""}`}>
      <div className="view-wrapper">
        <form className="songForm" onSubmit={(e) => e.preventDefault()}>
          <div className="form-inner-wrapper">
            <div className="selectedSong">
              <div className={`selectedSong-jacket-wrapper ${previewAudio.status === "playing" ? "playing" : ""}`}>
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
                <SongSearch
                  selectedSongOption={selectedSongOption}
                  onSongSelect={onSongSelect}
                  simfileOptions={simfileOptions}
                />
                <div className="song-artist">{selectedSong && selectedSong.artist}</div>

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
                    upward={false}
                  />
                  <label>By BPM Range</label>
                  <Dropdown
                    className="bpm-filter-dropdown"
                    selection
                    value={selectedFilters.bpm}
                    onChange={(_, data) => {
                      updateSelectedFilters({
                        bpm: data.value,
                      });
                    }}
                    options={bpmRangeOptions}
                    upward={false}
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
                    upward={false}
                  />
                  {/* <label>By Genre</label> */}
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
                    upward={false}
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
                    upward={false}
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
            selectedDifficultyOption={selectedDifficultyOption}
            selectedFilters={selectedFilters}
            isChartAvailable={isChartAvailable}
            gameEngine={props.gameEngine}
          />
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { audio, songSelect, screen, simfiles } = state;
  const { previewAudio } = audio;
  const { simfileList } = simfiles;
  return {
    previewAudio,
    simfileList,
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
