import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

import ChartArea from "../../components/chart/ChartArea";
import SongForm from "../../components/form/SongForm";
import ModsForm from "../../components/form/ModsForm";
import AudioPlayer from "../../core/AudioPlayer";
import { selectSong, selectDifficulty, selectMode } from "../../actions/SongSelectActions";
import { resizeScreen, setModalOpen } from "../../actions/ScreenActions";
import { getSimfileList, loadSimfile } from "../../actions/SimfileActions";
import { DEBUG_MODE } from "../../constants";
import LogView from "../../components/debug/LogView";

import WelcomeModal from "../../components/welcome/WelcomeModal";
import OffsetModal from "../../components/chart/OffsetModal";
import OffsetConfirmModal from "../../components/chart/OffsetConfirmModal";
import SettingsModal from "../../components/settings/SettingsModal";

const MainContainer = (props) => {
  const [loadingSimfiles, setLoadingSimfiles] = useState(true);

  const [gameEngine, setGameEngine] = useState(null);

  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoadingSimfiles(true);
      setLoadingAudio(true);
      setGameEngine(null);
      await fetchSimfiles();
      setLoadingSimfiles(false);

      AudioPlayer.setLoadingAudio = setLoadingAudio;

      window.addEventListener("resize", props.resizeScreen);

      // prompt user to adjust global offset on first visit
      const adjustedGlobalOffset = window.localStorage.getItem("adjustedGlobalOffset");
      if (!adjustedGlobalOffset) {
        // props.setModalOpen("offset");
        props.setModalOpen("welcome");
      }
    };

    init();
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

  const modalOpen = props.screen.modalOpen;

  return (
    <div className="main-container">
      {!loadingSimfiles && (
        <>
          {/* <Navbar history={props.history} /> */}
          <div className="view-container">
            <ChartArea
              location={props.location}
              loadingAudio={loadingAudio}
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
            <WelcomeModal modalOpen={modalOpen.welcome} />
            <OffsetModal modalOpen={modalOpen.offset} />
            <OffsetConfirmModal modalOpen={modalOpen.offsetConfirm} />
            <SettingsModal modalOpen={modalOpen.settings} />

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
  const { screen } = state;
  return {
    screen,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    selectSong: (song) => dispatch(selectSong(song)),
    selectDifficulty: (song) => dispatch(selectDifficulty(song)),
    selectMode: (song) => dispatch(selectMode(song)),
    resizeScreen: (e) => dispatch(resizeScreen(e)),
    getSimfileList: () => dispatch(getSimfileList()),
    loadSimfile: (song) => dispatch(loadSimfile(song)),
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer);
