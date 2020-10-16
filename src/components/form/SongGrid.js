import React from "react";

import { getJacketPath } from "../../utils";
import { SP_DIFFICULTIES } from "../../constants";
import { getClosestDifficulty } from "../../utils/songUtils";

const SongGrid = (props) => {
  const {
    displayedSongs,
    onSongSelect,
    selectedSongOption,
    selectedMode,
    selectedDifficultyOption,
    selectedFilters,
  } = props;

  console.log("selectedDifficultyOption", selectedDifficultyOption);

  let songs = displayedSongs;

  let availableSimfiles = {};
  if (props.gameEngine && props.gameEngine.simfiles) {
    availableSimfiles = props.gameEngine.simfiles;
  }

  const selectSong = (song) => {
    onSongSelect(song.hash);
  };

  const getDisplayedSongData = (song) => {
    let levels = [];
    if (selectedMode === "single") levels = song.levels.slice(0, 5);
    else if (selectedMode === "double")
      levels = [null, ...song.levels.slice(5, 9)];

    const levelFilter = selectedFilters.level;
    const difficultyFilter = selectedFilters.difficulty;

    // If neither level nor difficulty are being filtered, show the chosen difficulty option or whatever is closest
    if (difficultyFilter === "all" && levelFilter === "all") {
      const displayedLevels = [null, null, null, null, null];
      const difficultyIdx = SP_DIFFICULTIES.indexOf(selectedDifficultyOption);
      if (levels[difficultyIdx]) {
        displayedLevels[difficultyIdx] = levels[difficultyIdx];
      } else {
        const closestDiff = getClosestDifficulty(
          song,
          selectedDifficultyOption,
          selectedMode
        );
        const closestDiffIdx = SP_DIFFICULTIES.indexOf(closestDiff);
        displayedLevels[closestDiffIdx] = levels[closestDiffIdx];
      }
      levels = displayedLevels;
    } else {
      levels.forEach((level, i) => {
        if (!level) return;
        const difficulty = SP_DIFFICULTIES[i];
        // If level is chosen but difficulty is not, show all difficulties that match the level
        if (difficultyFilter === "all") {
          if (level !== levelFilter) levels[i] = null;
        }
        // If level is not chosen but difficulty is, show the filtered difficulty only
        // If both level and difficulty are chosen, show the filtered difficulty only
        else {
          if (difficulty !== difficultyFilter) levels[i] = null;
        }
      });
    }
    console.log("levels", levels);
    return levels;
  };

  const renderSongLevel = (song) => {
    // let levels = [];
    // if (selectedMode === "single") levels = song.levels.slice(0, 5);
    // else if (selectedMode === "double")
    //   levels = [null, ...song.levels.slice(5, 9)];

    // const levelFilter = selectedFilters.level;
    // const difficultyFilter = selectedFilters.difficulty;

    // // If neither level nor difficulty are being filtered, show the chosen difficulty option or whatever is closest
    // if (difficultyFilter === "all" && levelFilter === "all") {
    //   const displayedLevels = [null, null, null, null, null];
    //   const difficultyIdx = SP_DIFFICULTIES.indexOf(selectedDifficultyOption);
    //   if (levels[difficultyIdx]) {
    //     displayedLevels[difficultyIdx] = levels[difficultyIdx];
    //   } else {
    //     const closestDiff = getClosestDifficulty(
    //       song,
    //       selectedDifficultyOption,
    //       selectedMode
    //     );
    //     const closestDiffIdx = SP_DIFFICULTIES.indexOf(closestDiff);
    //     displayedLevels[closestDiffIdx] = levels[closestDiffIdx];
    //   }
    //   levels = displayedLevels;
    // } else {
    //   levels.forEach((level, i) => {
    //     if (!level) return;
    //     const difficulty = SP_DIFFICULTIES[i];
    //     // If level is chosen but difficulty is not, show all difficulties that match the level
    //     if (difficultyFilter === "all") {
    //       if (level !== levelFilter) levels[i] = null;
    //     }
    //     // If level is not chosen but difficulty is, show the filtered difficulty only
    //     // If both level and difficulty are chosen, show the filtered difficulty only
    //     else {
    //       if (difficulty !== difficultyFilter) levels[i] = null;
    //     }
    //   });
    // }
    const levels = getDisplayedSongData(song);

    return levels.map((level, i) => {
      if (!level) return null;
      const difficulty = SP_DIFFICULTIES[i];
      return (
        <div
          key={`${song.hash}_${difficulty}`}
          className={`song-level ${difficulty}`}
        >
          {level}
        </div>
      );
    });
  };

  // const isChartAvailable = (song) => {
  //   const levels = getDisplayedSongData(song);
  //   const filteredLevels = levels.filter((a) => a);

  //   // one matching level (99% of cases)
  //   if (filteredLevels.length === 1) {
  //     const level = filteredLevels[0];
  //     const difficultyIdx = levels.indexOf(level);
  //     const difficulty = SP_DIFFICULTIES[difficultyIdx];

  //     const isAvailable = availableSimfiles.hasOwnProperty(
  //       `${selectedMode}_${difficulty}`
  //     );
  //     console.log(
  //       `is ${song.title} ${selectedMode}_${difficulty} available`,
  //       isAvailable
  //     );
  //     return isAvailable;
  //   }
  //   // if multiple matching levels, go with the specified difficulty
  //   else {
  //     const isAvailable = availableSimfiles.hasOwnProperty(
  //       `${selectedMode}_${selectedDifficultyOption}`
  //     );
  //   }
  // };

  const renderSong = (song) => {
    return (
      <div
        className="songTile-wrapper"
        key={`songtile_${song.hash}`}
        onClick={() => selectSong(song)}
      >
        <div
          className={`songTile ${
            selectedSongOption === song.hash ? "selected" : ""
          } `}
        >
          <div className="song-jacket-wrapper">
            <img
              className="song-jacket"
              src={getJacketPath(`${song.hash}.png`)}
              title={song.title}
              alt={song.title}
            />
          </div>
          <div className="song-level-wrapper">{renderSongLevel(song)}</div>
          <div className="song-title-bar">{song.title}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="songGrid">
      {songs.map((song) => {
        return renderSong(song);
      })}
    </div>
  );
};

export default SongGrid;
