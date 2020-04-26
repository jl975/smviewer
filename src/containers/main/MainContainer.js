import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { tsv } from "d3-fetch";
import { Button } from "semantic-ui-react";

import ChartArea from "../../components/chart/ChartArea";
import SongForm from "../../components/form/SongForm";
import ModsForm from "../../components/form/ModsForm";
import MobileNav from "../../components/navigation/MobileNav";
import AudioPlayer from "../../core/AudioPlayer";
import { getOriginPath, fetchDocument, presetParams } from "../../utils";
import {
  selectSong,
  selectDifficulty,
  selectMode,
} from "../../actions/SongSelectActions";
import { resizeScreen } from "../../actions/ScreenActions";

const MainContainer = (props) => {
  const [loadingSimfiles, setLoadingSimfiles] = useState(true);
  const [simfileList, setSimfileList] = useState([]);
  const [selectedSM, setSelectedSM] = useState(null);
  const [selectedAudio, setSelectedAudio] = useState(null);

  const [activeView, setActiveView] = useState("chart");

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
    // TEMP: SM only; ignore Ace for Aces and Chaos Terror-Tech for now

    let smName = song.smName;

    // special case for tohoku evolved: pick one of its types at random
    if (song.hash === "OddDoQ6dqi0QdQDDOO6qlO08d8bPbli1") {
      smName = smName.replace("1", Math.floor(Math.random() * 4) + 1);
    }

    try {
      const sm = await fetchDocument(
        `${getOriginPath()}simfiles/${encodeURIComponent(smName)}.${
          song.useSsc ? "ssc" : "sm"
        }`
      );

      setSelectedSM(sm);
    } catch (err) {
      alert(err);
    }
  };

  const onDifficultySelect = (difficulty) => {
    // setSelectedDifficulty(difficulty);
    props.selectDifficulty(difficulty);
  };
  const onModeSelect = (mode) => {
    props.selectMode(mode);
  };

  const changeActiveView = (view) => {
    setActiveView(view);
    AudioPlayer.activeView = view;
  };

  return (
    <div className="main-container">
      {!loadingSimfiles && (
        <>
          <ChartArea
            loadingAudio={loadingAudio}
            // selectedSong={selectedSong}
            // selectedDifficulty={selectedDifficulty}
            // selectedMode={selectedMode}
            sm={selectedSM}
            selectedAudio={selectedAudio}
            gameEngine={gameEngine}
            setGameEngine={setGameEngine}
          />

          <SongForm
            activeView={activeView}
            setActiveView={changeActiveView}
            simfileList={simfileList}
            // selectedDifficulty={selectedDifficulty}
            // selectedMode={selectedMode}
            onSongSelect={onSongSelect}
            onDifficultySelect={onDifficultySelect}
            onModeSelect={onModeSelect}
            loadingAudio={loadingAudio}
          />

          <ModsForm activeView={activeView} />

          <MobileNav activeView={activeView} setActiveView={changeActiveView} />
        </>
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
