import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import ChartArea from "../../components/chart/ChartArea";
import SongForm from "../../components/form/SongForm";
import ModsForm from "../../components/form/ModsForm";
import Navbar from "../../components/navigation/Navbar";
import AudioPlayer from "../../core/AudioPlayer";
import {
  selectSong,
  selectDifficulty,
  selectMode,
} from "../../actions/SongSelectActions";
import { resizeScreen } from "../../actions/ScreenActions";
import { getSimfileList, loadSimfile } from "../../actions/SimfileActions";
import { DEBUG_MODE } from "../../constants";
import LogView from "../../components/debug/LogView";

const MainContainer = (props) => {
  const [loadingSimfiles, setLoadingSimfiles] = useState(true);
  const [selectedSM, setSelectedSM] = useState(null);

  const [gameEngine, setGameEngine] = useState(null);

  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchSimfiles();
      setLoadingSimfiles(false);
    };
    fetchData();

    AudioPlayer.setLoadingAudio = setLoadingAudio;

    window.addEventListener("resize", props.resizeScreen);
  }, []);

  const fetchSimfiles = async () => {
    try {
      await props.getSimfileList();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const onSongSelect = async (song, initialProgress = 0) => {
    // console.log("MainContainer selected song", song);
    AudioPlayer.selectSong(song, initialProgress);
    // setSelectedSong(song);

    props.selectSong(song);

    document.title = `${song.title} - SMViewer`;

    // retrieve audio file and simfile from song.simfilePath

    props.loadSimfile(song);
  };

  const onDifficultySelect = (difficulty) => {
    // setSelectedDifficulty(difficulty);
    props.selectDifficulty(difficulty);
  };
  const onModeSelect = (mode) => {
    props.selectMode(mode);
  };

  return (
    <div className="main-container">
      {!loadingSimfiles && (
        <>
          <Navbar />
          <div className="view-container">
            <ChartArea
              loadingAudio={loadingAudio}
              sm={selectedSM}
              gameEngine={gameEngine}
              setGameEngine={setGameEngine}
            />
            <ModsForm />
            <SongForm
              onSongSelect={onSongSelect}
              onDifficultySelect={onDifficultySelect}
              onModeSelect={onModeSelect}
              loadingAudio={loadingAudio}
              location={props.location}
              gameEngine={gameEngine}
            />

            {DEBUG_MODE && <LogView />}
          </div>
        </>
      )}
      {DEBUG_MODE && (
        <div id="debugLog">
          <div className="debug-text1" />
          <div className="debug-text2" />
          <div className="debug-text3" />
          <div className="debug-text4" />
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    selectSong: (song) => dispatch(selectSong(song)),
    selectDifficulty: (song) => dispatch(selectDifficulty(song)),
    selectMode: (song) => dispatch(selectMode(song)),
    resizeScreen: (e) => dispatch(resizeScreen(e)),
    getSimfileList: () => dispatch(getSimfileList()),
    loadSimfile: (song) => dispatch(loadSimfile(song)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer);
