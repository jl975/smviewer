import React, { useState, useEffect, useRef } from "react";
import { Dropdown } from "semantic-ui-react";
import { connect } from "react-redux";

import * as actions from "../../actions/SongSelectActions";
import SongGrid from "./SongGrid";
import { getJacketPath, presetParams } from "../../utils";
import ToggleSwitch from "../ui/ToggleSwitch";
import {
  SP_DIFFICULTIES,
  DP_DIFFICULTIES,
  TITLE_CATEGORIES,
  LEVELS,
  DDR_VERSIONS,
} from "../../constants";
import AudioPlayer from "../../core/AudioPlayer";
import { ReactComponent as AudioWave } from "../../svg/audiowave.svg";

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

const difficultySortOptions = [
  { key: "difficulty_all", value: "all", text: "ALL" },
].concat(
  SP_DIFFICULTIES.map((difficulty) => {
    return {
      key: `difficulty_${difficulty}`,
      value: difficulty,
      text: difficulty,
    };
  })
);

const SongForm = (props) => {
  const {
    activeView,
    simfileList,
    selectedDifficulty,
    selectedMode,
    previewAudio,
  } = props;
  const songGridContainer = useRef();

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
    difficulty: "all",
    // level: 10,
  });

  const [displayedSongs, setDisplayedSongs] = useState([]);

  // on filter change
  useEffect(() => {
    const { title, version, level, difficulty } = selectedFilters;

    const songs = simfileList
      .filter((song) => {
        return (
          (title === "all" || title === song.abcSort) &&
          (version === "all" || version === parseInt(song.version)) &&
          (level === "all" ||
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
  }, [selectedFilters]);

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
      let progress = presetParams.progress ? presetParams.progress / 100000 : 0;
      onSongSelect(null, { value: presetParams.song }, progress);
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
      onSongSelect(null, { value: "POq8OPlOO9199i11Od0P00801Qo01DQo" }); // rtswy
      // onSongSelect(null, { value: "QQldo10ObPPQPlliODiDIIl0Q1oPoo61" }); // deltamax
      // onSongSelect(null, { value: "06loOQ0DQb0DqbOibl6qO81qlIdoP9DI" }); // paranoia
      // onSongSelect(null, { value: "0dOi10q9Q6oi0Q9960iQQDO6olqlDDqo" }); // private eye
      // onSongSelect(null, { value: "9I00D9Id61iD6QP8i8Dd6698PoQ9bdi9" }); // okome
      // onSongSelect(null, { value: "O9qDQOQO8dDDIiO9dPP0Pb8qQo9l89D9" }); // triperfect
      // onSongSelect(null, { value: "0IldoDlDQql99DqQo0Qq9ioPIiiPoIoi" }); // pluto relinquish
      // onSongSelect(null, { value: "PIO8dod8P9OOP1bi0D1POIi6OdOdQDql" }); // pluto the first
      // onSongSelect(null, { value: "8O6b1D9PDO0ll1IO9d1ODDPPo0QPQbob" }); // tme
    }
  }, []);

  useEffect(() => {
    if (selectedSongOption) {
      const song = simfileList.find((song) => song.hash === selectedSongOption);
      setSelectedSong(song);
      AudioPlayer.storeAudioSource(song);
    }
  }, [selectedSongOption]);

  const onSongSelect = async (e, data, initialProgress = 0) => {
    const songHash = data.value;
    setSelectedSongOption(songHash);

    // console.log("setSelectedSongOption", songHash);
    AudioPlayer.stopSongPreview();

    const song = simfileList.find((song) => song.hash === songHash);

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
      if (song.levels[selectedDiffOptionIndex]) {
        props.onDifficultySelect(selectedDifficultyOption);
      } else {
        /*
          If the song does not have a chart corresponding to the chosen difficulty option,
          pick whatever is *closest*
          - If Difficult, Expert, or Challenge is the chosen option, start from Challenge and
            work your way down until the first available difficulty is reached.
          - If Beginner or Basic is the chosen option, start from Beginner and work up.
          The closest available difficulty will be chosen for the song without affecting the
          difficulty option selected for the form, like the way it works in the real game
        */
        const difficulties =
          selectedMode === "double" ? DP_DIFFICULTIES : SP_DIFFICULTIES;
        const levels =
          selectedMode === "double"
            ? song.levels.slice(5, 9)
            : song.levels.slice(0, 5);
        if (
          ["Difficult", "Expert", "Challenge"].includes(
            selectedDifficultyOption
          )
        ) {
          for (let i = difficulties.length - 1; i >= 0; i--) {
            if (levels[i]) {
              props.onDifficultySelect(difficulties[i]);
              break;
            }
          }
        } else if (["Beginner", "Basic"].includes(selectedDifficultyOption)) {
          for (let i = 0; i <= difficulties.length - 1; i++) {
            if (levels[i]) {
              props.onDifficultySelect(difficulties[i]);
              break;
            }
          }
        }
      }
    }

    // automatically update chart
    props.onSongSelect(song, initialProgress);
  };

  const handleDifficultySelect = (difficulty) => {
    setSelectedDifficultyOption(difficulty);
    props.onDifficultySelect(difficulty);
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
                  onChange={(value) => props.onModeSelect(value)}
                  value={selectedMode}
                />
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
                    setSelectedFilters({
                      ...selectedFilters,
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
                    setSelectedFilters({
                      ...selectedFilters,
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
                    setSelectedFilters({
                      ...selectedFilters,
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
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { audio, songSelect } = state;
  const { previewAudio } = audio;
  return {
    previewAudio,
    selectedDifficulty: songSelect.difficulty,
    selectedMode: songSelect.mode,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    selectSong: (song) => dispatch(actions.selectSong(song)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SongForm);
