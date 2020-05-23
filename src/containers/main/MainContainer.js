import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { tsv } from "d3-fetch";

import ChartArea from "../../components/chart/ChartArea";
import SongForm from "../../components/form/SongForm";
import ModsForm from "../../components/form/ModsForm";
import Navbar from "../../components/navigation/Navbar";
import AudioPlayer from "../../core/AudioPlayer";
import { getOriginPath, fetchDocument } from "../../utils";
import {
  selectSong,
  selectDifficulty,
  selectMode,
} from "../../actions/SongSelectActions";
import { resizeScreen } from "../../actions/ScreenActions";
import loadStore from "../../utils/loadStore";
import { DEBUG_MODE } from "../../constants";

const MainContainer = (props) => {
  const [loadingSimfiles, setLoadingSimfiles] = useState(true);
  const [simfileList, setSimfileList] = useState([]);
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
      const parsedTsv = await tsv(getOriginPath() + "data/simfiles.tsv");
      parsedTsv.forEach((row) => {
        row.levels = row.levels
          .split(",")
          .map((level) => (level ? parseInt(level) : null));
      });

      // console.log("simfiles", parsedTsv);
      setSimfileList(parsedTsv);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const onSongSelect = async (song, initialProgress = 0) => {
    console.log("MainContainer selected song", song);
    AudioPlayer.selectSong(song, initialProgress);
    // setSelectedSong(song);

    props.selectSong(song);

    document.title = `${song.title} - SMViewer`;

    // retrieve audio file and simfile from song.simfilePath

    let smName = song.smName;

    // special case for tohoku evolved: pick one of its types at random
    if (song.hash === "OddDoQ6dqi0QdQDDOO6qlO08d8bPbli1") {
      smName = smName.replace("1", Math.floor(Math.random() * 4) + 1);
    }

    try {
      // Immediately update the value of "last requested song"
      // Any pending requests that finish before the last song is loaded will be ignored
      loadStore.lastRequestedSong = song.title;
      const sm = await fetchDocument(
        `${getOriginPath()}simfiles/${encodeURIComponent(smName)}.${
          song.useSsc ? "ssc" : "sm"
        }`
      );

      // User might try to select a new song before the simfile is fetched.
      // Only process simfile if this is the last song that was selected
      if (loadStore.lastRequestedSong === song.title) {
        setSelectedSM(sm);
      }
    } catch (err) {
      alert(`Song ${song.title} failed to load`, err);
    }
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
              simfileList={simfileList}
              onSongSelect={onSongSelect}
              onDifficultySelect={onDifficultySelect}
              onModeSelect={onModeSelect}
              loadingAudio={loadingAudio}
            />
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MainContainer);
