import React from "react";
import { connect } from "react-redux";

import { SP_DIFFICULTIES, DP_DIFFICULTIES } from "../../constants";

// displays song information on the chart view
const SongInfo = (props) => {
  const { chart, selectedSong, selectedDifficulty, selectedMode } = props;
  return (
    <>
      <div className="song-information">
        {selectedSong && (
          <>
            <div className="song-title">{selectedSong.title}</div>
            <div className="song-artist">{selectedSong.artist}</div>
          </>
        )}
      </div>
      <div className="bpm-information">
        <div className="bpm-header">BPM</div>
        <div className="bpm-value">{chart.activeBpm}</div>
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
    </>
  );
};

const mapStateToProps = (state) => {
  const { chart, songSelect } = state;
  return {
    chart,
    selectedSong: songSelect.song,
    selectedDifficulty: songSelect.difficulty,
    selectedMode: songSelect.mode,
  };
};

export default connect(mapStateToProps, null)(SongInfo);
