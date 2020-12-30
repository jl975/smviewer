import React from "react";
import { connect } from "react-redux";

import { getChartLevel } from "../../utils/songUtils";

// displays song information on the chart view
const SongInfo = (props) => {
  const { selectedSong, selectedDifficulty, selectedMode } = props;
  return (
    <>
      <div className="song-info-row">
        <div className="song-information">
          {selectedSong && (
            <>
              <div className="song-title">{selectedSong.title}</div>
              <div className="song-artist">{selectedSong.artist}</div>
            </>
          )}
        </div>
        <div className="level-information">
          {selectedSong && (
            <>
              <div className="song-difficulty">{selectedDifficulty}</div>
              <div className="song-level">{getChartLevel(selectedSong, selectedDifficulty, selectedMode)}</div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const mapStateToProps = (state) => {
  const { songSelect } = state;
  return {
    selectedSong: songSelect.song,
    selectedDifficulty: songSelect.difficulty,
    selectedMode: songSelect.mode,
  };
};

export default connect(mapStateToProps, null)(SongInfo);
