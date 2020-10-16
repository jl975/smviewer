import axios from "axios";

// map stepmania chart difficulties to their corresponding DDR difficulties
const modeRegex = /dance-([a-z]+)/;
const difficultyRegex = /(Beginner|Easy|Medium|Hard|Challenge|Edit)/;
const difficultyMap = {
  Beginner: "Beginner",
  Easy: "Basic",
  Medium: "Difficult",
  Hard: "Expert",
  Challenge: "Challenge",
};

export const getDisplayBpmFromSm = (sm) => {
  // Display bpm
  if (/#DISPLAYBPM:/i.test(sm)) {
    let displayBpm = /#DISPLAYBPM:([\s\S]*?)\s*;/i.exec(sm)[1];
    displayBpm = displayBpm
      .split(":")
      .map((bpm) => parseInt(bpm))
      .join("-");
    return displayBpm;
  } else {
    let bpm = /#BPMS:([\s\S]*?)\s*;/i.exec(sm)[1];
    bpm = bpm.split(",").map((point) => {
      point = point.split("=");
      return Math.round(parseFloat(point[1]));
    });
    let displayBpm = [Math.min(...bpm), Math.max(...bpm)];
    if (displayBpm[0] === displayBpm[1]) displayBpm = [displayBpm[0]];
    displayBpm = displayBpm.join("-");
    return displayBpm;
  }
};

export const getMissingDifficultiesFromSm = (sm) => {
  let missingDifficulties = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const diffToIndex = [
    "single_Beginner",
    "single_Easy",
    "single_Medium",
    "single_Hard",
    "single_Challenge",
    "double_Easy",
    "double_Medium",
    "double_Hard",
    "double_Challenge",
  ];

  // assume sm for now, not ssc
  const chartStrs = sm
    .slice(sm.indexOf("#NOTES:"))
    .split(/#NOTES:\s+/)
    .slice(1);

  chartStrs.forEach((chartStr) => {
    const mode = modeRegex.exec(chartStr)[1]; // single or double
    if (mode !== "single" && mode !== "double") return;
    let smDifficulty = difficultyRegex.exec(chartStr)[1];
    const diffIndex = diffToIndex.indexOf(`${mode}_${smDifficulty}`);
    if (diffIndex > -1) {
      missingDifficulties[diffIndex] = null;
    }
  });
  return missingDifficulties;
};

export const getFileName = (filePath) => {
  const lastSlashIdx = filePath.lastIndexOf("/");
  const fileDotIdx = filePath.lastIndexOf(".");
  return decodeURIComponent(filePath.slice(lastSlashIdx + 1, fileDotIdx));
};

export const getEagateData = async (songId) => {
  const res = await axios.get("/api/eagate_data", { params: { songId } });
  return res.data;
};

export const getSmFromUrl = async (smUrl) => {
  const res = await axios.get("/api/simfile_from_url", { params: { smUrl } });
  console.log(res);
  return res.data;
};

export const getSongPosition = async ({ title, id }) => {
  const res = await axios.get("/api/eagate_song_search", {
    params: { title, id },
  });
  return res.data;
};

export const updateSimfiles = async (payload) => {
  const res = await axios.put("/api/update_simfiles", payload);
  return res.data;
};

export const addSimfile = async (payload) => {
  const res = await axios.post("/api/add_simfile", payload);
  return res.data;
};
