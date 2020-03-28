import React, { useState, useEffect } from "react";

import ChartArea from "../../components/chart/ChartArea";
import Form from "../../components/form";
import { optionDefaultValues } from "../../components/form/options";
import { fetchDocument } from "../../utils";
import { tsv } from "d3-fetch";

const MainContainer = props => {
  const [loading, setLoading] = useState(true);
  const [simfileList, setSimfileList] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [selectedSM, setSelectedSM] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    optionDefaultValues.difficulty
  );
  const [selectedAudio, setSelectedAudio] = useState(null);

  const [mods, setMods] = useState(optionDefaultValues.mods);

  const [gameEngine, setGameEngine] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetchSimfiles();
      setLoading(false);
    };
    fetchData();
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
    setSelectedSong(song);

    console.log("MainContainer onSongSelect, song", song);

    // retrieve audio file and simfile from song.simfilePath
    // TEMP: SM only; ignore Ace for Aces and Chaos Terror-Tech for now
    const sm = await fetchDocument(
      `https://cors-anywhere.herokuapp.com/${song.simfilePath}.sm`
    );
    setSelectedSM(sm);

    if (selectedAudio) selectedAudio.load(); // stops any currently playing audio

    let audio = new Audio(song.simfilePath + ".ogg");
    audio.pause();
    setSelectedAudio(audio);
  };

  const onDifficultySelect = difficulty => {
    setSelectedDifficulty(difficulty);
  };

  return (
    <div className="main-container">
      {!loading && (
        <>
          <ChartArea
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
