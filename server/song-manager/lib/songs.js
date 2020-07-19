import fs from "fs";
import path from "path";
import { title } from "process";

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

export const addSimfile = (payload) => {
  const { previousSongId } = payload;

  const songList = getSimfilesTsv();

  // Parse simfiles.tsv into a json array and iterate through the songs.
  // Find the song corresponding to the previousSongId and make note of its index.
  // Construct the object for the newly added song and assign as its index the number
  // immediately following the index of the previous song.
  // Insert the new song object into the list in the position after the previous song.
  // Iterate through the rest of the song list and increment their indices by one each.
  let index = 0,
    newSongAdded = false;

  // loop until previous song is reached/new song is added
  while (!newSongAdded) {
    const song = songList[index];
    if (song.hash === previousSongId) {
      const previousSongIndex = +song.index;
      const newSongObj = {
        index: previousSongIndex + 1,
        hash: payload.hash,
        title: payload.title,
        smName: payload.smName,
        artist: payload.artist,
        version: payload.version,
        levels: payload.levels,
        displayBpm: payload.displayBpm,
        abcSort: payload.abcSort,
        dAudioUrl: payload.dAudioUrl,
        useSsc: null,
      };
      songList.splice(index + 1, 0, newSongObj);
      newSongAdded = true;
      index += 2;
    } else {
      index++;
    }
  }
  // after new song has been added, loop until end of song list
  while (index < songList.length) {
    const song = songList[index];
    song.index = +song.index + 1;
    index++;
  }

  // return songList;
  const output = writeSimfileToTsv(songList);

  return output;
};

export const updateSimfiles = (payload) => {
  const songList = getSimfilesTsv();

  const { index, hash, title, smName, artist, version, levels, displayBpm, abcSort, dAudioUrl, useSsc } = payload;

  // find the existing song object in the list and replace it with the relevant parts of the payload
  const newSongObj = {
    index,
    hash,
    title,
    smName,
    artist,
    version,
    levels,
    displayBpm,
    abcSort,
    dAudioUrl,
    useSsc,
  };

  for (let i = 0; i < songList.length; i++) {
    if (songList[i].hash === hash) {
      songList[i] = { ...songList[i], ...newSongObj };
    }
  }

  const output = writeSimfileToTsv(songList);

  return output;
};

const writeSimfileToTsv = (json) => {
  // write to simfiles.tsv
  let output = "";

  // console.log(json);
  const headers = Object.keys(json[0]);

  output += headers.join("\t");

  json.forEach((song) => {
    let row = "\n";
    headers.forEach((header) => {
      let value = song[header];
      if (value === null) value = "";
      row += value + "\t";
    });
    output += row;
  });

  const testSimfileTsvPath = path.join(process.cwd(), "../../public/data/simfiles_test.tsv");

  fs.writeFile(testSimfileTsvPath, output, "utf8", (err) => {
    if (err) console.log(err);
  });

  return output;
};
