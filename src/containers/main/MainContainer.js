import React, { useState, useEffect } from "react";

import ChartArea from "../../components/chart/ChartArea";
import Form from "../../components/form";
import { optionDefaultValues } from "../../components/form/options";
import { fetchDocument } from "../../utils";

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

  useEffect(() => {
    const fetchData = async () => {
      await fetchSimfiles();

      setLoading(false);
    };
    fetchData();
  }, []);

  const fetchSimfiles = async () => {
    const tsv = await fetchDocument(
      window.location.origin + "/data/simfiles.tsv"
    );

    const parsedTsv = tsv.split("\n").map(row => {
      const [hash, title, smUrl] = row.split("\t");
      const simfilePath = smUrl.replace(/(.sm$)|(.ssc$)/, "");
      return { hash, title, simfilePath };
    });
    setSimfileList(parsedTsv);
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
          />
        </>
      )}
    </div>
  );
};

export default MainContainer;
