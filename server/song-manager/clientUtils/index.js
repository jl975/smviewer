import axios from "axios";

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
  const res = await axios.get("/api/eagate_song_search", { params: { title, id } });
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
