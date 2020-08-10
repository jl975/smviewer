import { tsv } from "d3-fetch";

import { getOriginPath, fetchDocument } from "../utils";

export const GET_SIMFILE_LIST = "GET_SIMFILE_LIST";

export const getSimfileList = () => async dispatch => {
  try {
    const parsedTsv = await tsv(getOriginPath() + "data/simfiles.tsv");
    parsedTsv.forEach(row => {
      row.levels = row.levels
        .split(",")
        .map(level => (level ? parseInt(level) : null));
    });

    console.log("xixi");
    dispatch({
      type: GET_SIMFILE_LIST,
      payload: parsedTsv
    });
  } catch (error) {
    throw error;
  }
};
