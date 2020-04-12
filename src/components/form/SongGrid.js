import React from "react";

import AudioPlayer from "../../core/AudioPlayer";
import { getJacketPath } from "../../utils";

const SongGrid = (props) => {
  const { displayedSongs, onSongSelect, selectedSongOption } = props;

  // let songs = displayedSongs.slice(200, 300);
  let songs = displayedSongs;

  // console.log("songs", songs);

  const selectSong = (song) => {
    onSongSelect(null, { value: song.hash });
    // console.log("select song", song);
  };

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
          }`}
        >
          <div className="song-jacket-wrapper">
            <img
              className="song-jacket"
              src={getJacketPath(`${song.hash}.png`)}
              title={song.title}
              alt={song.title}
            />
          </div>
          <div className="song-title-bar">{song.title}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="songGrid-container">
      <div className="songGrid">
        {songs.map((song) => {
          return renderSong(song);
        })}
      </div>
    </div>
  );
};

export default SongGrid;
