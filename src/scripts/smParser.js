const fs = require("fs");
const simfileDirectoryPath = "../../public/simfiles";
const chartLevels = require("../../public/data/chart_levels.json");

const modeRegex = /dance-([a-z]+)/;
const difficultyRegex = /(Beginner|Easy|Medium|Hard|Challenge|Edit)/;

const difficultyIndices = [
  "single Beginner",
  "single Easy",
  "single Medium",
  "single Hard",
  "single Challenge",
  "double Easy",
  "double Medium",
  "double Hard",
  "double Challenge",
];

const difficultyMap = {
  Beginner: "Beginner",
  Easy: "Basic",
  Medium: "Difficult",
  Hard: "Expert",
  Challenge: "Challenge",
};

const getMetadataFromSM = (json) => {
  for (let i = 0; i < json.length; i++) {
    const song = json[i];
    const { smName } = song;

    // console.log(song);
    let sm;

    try {
      sm = fs.readFileSync(`${simfileDirectoryPath}/${smName}.sm`, "utf-8");
    } catch (err) {
      continue;
    }
    // console.log(sm);

    if (/#ARTIST:/i.test(sm)) {
      const artist = /#ARTIST:([\s\S]*?)\s*;/i.exec(sm)[1];
      song.artist = artist;
    }

    if (/#SAMPLESTART:/i.test(sm)) {
      const sampleStart = /#SAMPLESTART:([\s\S]*?)\s*;/i.exec(sm)[1];
      song.sampleStart = parseFloat(sampleStart);
    }
    if (/#SAMPLELENGTH:/i.test(sm)) {
      const sampleLength = /#SAMPLELENGTH:([\s\S]*?)\s*;/i.exec(sm)[1];
      song.sampleLength = parseFloat(sampleLength);
    }

    // Display bpm
    if (/#DISPLAYBPM:/i.test(sm)) {
      let displayBpm = /#DISPLAYBPM:([\s\S]*?)\s*;/i.exec(sm)[1];
      displayBpm = displayBpm
        .split(":")
        .map((bpm) => parseInt(bpm))
        .join("-");
      // console.log(`${smName}: ${displayBpm}`);
      song.displayBpm = displayBpm;
    } else {
      let bpm = /#BPMS:([\s\S]*?)\s*;/i.exec(sm)[1];
      bpm = bpm.split(",").map((point) => {
        point = point.split("=");
        return Math.round(parseFloat(point[1]));
      });
      let displayBpm = [Math.min(...bpm), Math.max(...bpm)];
      if (displayBpm[0] === displayBpm[1]) displayBpm = [displayBpm[0]];
      displayBpm = displayBpm.join("-");
      song.displayBpm = displayBpm;
    }

    const chartStrs = sm
      .slice(sm.indexOf("#NOTES:"))
      .split(/#NOTES:\s+/)
      .slice(1);

    const levelList = Array(9);

    // chartStrs.forEach((chartStr) => {
    //   const mode = modeRegex.exec(chartStr)[1]; // single or double
    //   const smDifficulty = difficultyRegex.exec(chartStr)[1];

    //   if (!Object.keys(difficultyMap).includes(smDifficulty)) return;

    //   const levelRegex = new RegExp(`${smDifficulty}:\\s+([0-9]+):`);
    //   const level = parseInt(levelRegex.exec(chartStr)[1]);

    //   const difficultyIndex = difficultyIndices.indexOf(
    //     `${mode} ${smDifficulty}`
    //   );
    //   levelList[difficultyIndex] = level;
    // });
    // song.levels = levelList.join(",");

    // Some simfile levels are inaccurate. Use official eAmuse data for these
    if (chartLevels[song.hash]) {
      song.levels = chartLevels[song.hash].levels;
      console.log(`${song.title} ${song.levels}`);
    }
  }

  return json;
};

module.exports = { getMetadataFromSM };
