import React, { useState, useEffect } from "react";
import { tsv } from "d3-fetch";
import { Button } from "semantic-ui-react";

import ChartArea from "../../components/chart/ChartArea";
import SongForm from "../../components/form/SongForm";
import ModsForm from "../../components/form/ModsForm";
import MobileNav from "../../components/navigation/MobileNav";
import AudioPlayer from "../../core/AudioPlayer";
import { optionDefaultValues } from "../../components/form/options";
import { fetchDocument } from "../../utils";

const MainContainer = (props) => {
  const [loadingSimfiles, setLoadingSimfiles] = useState(true);
  const [simfileList, setSimfileList] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedSM, setSelectedSM] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    optionDefaultValues.difficulty
  );
  const [selectedAudio, setSelectedAudio] = useState(null);

  const [mods, setMods] = useState(optionDefaultValues.mods);
  const [activeView, setActiveView] = useState("song");

  const [gameEngine, setGameEngine] = useState(null);

  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      await fetchSimfiles();
      setLoadingSimfiles(false);
    };
    fetchData();

    AudioPlayer.setLoadingAudio = setLoadingAudio;
  }, []);

  const fetchSimfiles = async () => {
    try {
      const parsedTsv = await tsv(window.location.href + "/data/simfiles.tsv");
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

  const onSongSelect = async (song) => {
    console.log("MainContainer selected song", song);
    AudioPlayer.selectSong(song);
    setSelectedSong(song);

    // retrieve audio file and simfile from song.simfilePath
    // TEMP: SM only; ignore Ace for Aces and Chaos Terror-Tech for now

    let smName = song.smName;

    // special case for tohoku evolved: pick one of its types at random
    if (song.hash === "OddDoQ6dqi0QdQDDOO6qlO08d8bPbli1") {
      smName = smName.replace("1", Math.floor(Math.random() * 4) + 1);
    }

    try {
      const sm = await fetchDocument(
        `${window.location.href}/simfiles/${encodeURIComponent(smName)}.sm`
      );
      setSelectedSM(sm);
    } catch (err) {
      alert(err);
    }
  };

  const onDifficultySelect = (difficulty) => {
    setSelectedDifficulty(difficulty);
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
            selectedSong={selectedSong}
            selectedDifficulty={selectedDifficulty}
            sm={selectedSM}
            selectedAudio={selectedAudio}
            gameEngine={gameEngine}
            setGameEngine={setGameEngine}
          />

          <SongForm
            activeView={activeView}
            setActiveView={changeActiveView}
            simfileList={simfileList}
            selectedDifficulty={selectedDifficulty}
            onSongSelect={onSongSelect}
            onDifficultySelect={onDifficultySelect}
            loadingAudio={loadingAudio}
          />

          <ModsForm
            activeView={activeView}
            simfileList={simfileList}
            selectedSong={selectedSong}
            onSongSelect={onSongSelect}
            selectedDifficulty={selectedDifficulty}
            onDifficultySelect={onDifficultySelect}
            selectedAudio={selectedAudio}
            setSelectedAudio={setSelectedAudio}
            gameEngine={gameEngine}
          />

          <MobileNav activeView={activeView} setActiveView={changeActiveView} />
        </>
      )}
    </div>
  );
};

export default MainContainer;
