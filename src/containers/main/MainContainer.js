import React, { useState, useEffect } from "react";
import { tsv } from "d3-fetch";
import { Howler } from "howler";

import ChartArea from "../../components/chart/ChartArea";
import Form from "../../components/form";
import AudioPlayer from "../../core/AudioPlayer";
import { optionDefaultValues } from "../../components/form/options";
import { fetchDocument } from "../../utils";

const MainContainer = props => {
  const [loadingSimfiles, setLoadingSimfiles] = useState(true);
  const [simfileList, setSimfileList] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedSM, setSelectedSM] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    optionDefaultValues.difficulty
  );
  const [selectedAudio, setSelectedAudio] = useState(null);

  const [mods, setMods] = useState(optionDefaultValues.mods);

  const [gameEngine, setGameEngine] = useState(null);

  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    // alert(JSON.stringify(Howler._codecs));

    const fetchData = async () => {
      await fetchSimfiles();
      setLoadingSimfiles(false);
    };
    fetchData();

    AudioPlayer.setLoadingAudio = setLoadingAudio;
  }, []);

  const fetchSimfiles = async () => {
    try {
      const parsedTsv = await tsv(
        window.location.origin + "/data/simfiles.tsv"
      );
      parsedTsv.forEach(row => {
        row.simfilePath = row.smUrl.replace(/(.sm$)|(.ssc$)/, "");
      });
      setSimfileList(parsedTsv);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const onSongSelect = async song => {
    console.log("MainContainer selected song", song);
    AudioPlayer.selectSong(song);
    setSelectedSong(song);

    // retrieve audio file and simfile from song.simfilePath
    // TEMP: SM only; ignore Ace for Aces and Chaos Terror-Tech for now
    const sm = await fetchDocument(
      // `https://cors-anywhere.herokuapp.com/${song.simfilePath}.sm`
      `${window.location.origin}/simfiles/${song.smName}`
    );
    setSelectedSM(sm);
  };

  const onDifficultySelect = difficulty => {
    setSelectedDifficulty(difficulty);
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
            mods={mods}
            gameEngine={gameEngine}
            setGameEngine={setGameEngine}
          />
          <Form
            simfileList={simfileList}
            selectedSong={selectedSong}
            onSongSelect={onSongSelect}
            selectedDifficulty={selectedDifficulty}
            onDifficultySelect={onDifficultySelect}
            selectedAudio={selectedAudio}
            setSelectedAudio={setSelectedAudio}
            mods={mods}
            setMods={setMods}
            gameEngine={gameEngine}
          />
        </>
      )}
    </div>
  );
};

export default MainContainer;
