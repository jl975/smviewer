import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

import { SP_DIFFICULTIES, DP_DIFFICULTIES } from "../../constants";

// displays song information on the chart view
const SongInfo = props => {
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
              <div className="song-level">
                {
                  selectedSong.levels[
                    selectedMode === "double"
                      ? DP_DIFFICULTIES.indexOf(selectedDifficulty) + 5
                      : SP_DIFFICULTIES.indexOf(selectedDifficulty)
                  ]
                }
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const mapStateToProps = state => {
  const { songSelect } = state;
  return {
    selectedSong: songSelect.song,
    selectedDifficulty: songSelect.difficulty,
    selectedMode: songSelect.mode
  };
};

export default connect(
  mapStateToProps,
  null
)(SongInfo);
