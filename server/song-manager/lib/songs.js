import fs from "fs";
import path from "path";

const simfileTsvPath = path.join(process.cwd(), "../../public/data/simfiles.tsv");

export function getSimfilesTsv() {
  let parsedTsv = parseSimfileTsv();
  return parsedTsv;
}

export function getSongData(index) {
  const songs = getSimfilesTsv();
  return songs[index];
}

const parseSimfileTsv = () => {
  let tsv = fs.readFileSync(simfileTsvPath, "utf-8").split("\n");

  const headers = tsv[0].split("\t");

  const output = [];
  for (let i = 1; i < tsv.length; i++) {
    const values = tsv[i].split("\t");
    const row = {};
    row.index = i - 1; // way to keep track of the original eamuse song order
    values.forEach((value, col) => {
      if (value === "") value = null;
      const header = headers[col];
      row[header] = value;
    });
    output.push(row);
  }

  return output;
};

export const getAllSongIndices = () => {
  let tsv = fs.readFileSync(simfileTsvPath, "utf-8").split("\n");
  const songIndices = [];
  for (let i = 1; i < tsv.length; i++) {
    songIndices.push({
      params: {
        index: (i - 1).toString(),
      },
    });
  }
  return songIndices;
};

export const getJacketPath = (id) => {
  const image = fs.readFileSync(path.join(process.cwd() + `/../../public/jackets/${id}.png`));
  return new Buffer(image).toString("base64");
};
