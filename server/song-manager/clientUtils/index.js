import axios from "axios";

export const getDisplayBpm = (sm) => {
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

export const getEagateData = async (songId) => {
  const res = await axios.get("/api/eagate_data", { params: { songId } });
  return res.data;
};
