import fs from 'fs'
import path from 'path'
import { title } from 'process'
import request from 'request-promise'

const simfileTsvPath = path.join(process.cwd(), '../../public/data/simfiles.tsv')

const jacketPath = path.join(process.cwd(), '../../public/jackets')
const simfilePath = path.join(process.cwd(), '../../public/simfiles')

export function getSimfilesTsv() {
  let parsedTsv = parseSimfileTsv()
  return parsedTsv
}

export function getSongData(index) {
  const songs = getSimfilesTsv()
  return songs[index]
}

const parseSimfileTsv = () => {
  let tsv = fs.readFileSync(simfileTsvPath, 'utf-8').split('\n')

  const headers = tsv[0].split('\t')

  const output = []
  for (let i = 1; i < tsv.length; i++) {
    const values = tsv[i].split('\t')
    const row = {}
    row.index = i - 1 // way to keep track of the original eamuse song order
    values.forEach((value, col) => {
      if (value === '') value = null
      const header = headers[col]
      if (!header) return
      row[header] = value
    })
    output.push(row)
  }

  return output
}

export const getAllSongIndices = () => {
  let tsv = fs.readFileSync(simfileTsvPath, 'utf-8').split('\n')
  const songIndices = []
  for (let i = 1; i < tsv.length; i++) {
    songIndices.push({
      params: {
        index: (i - 1).toString(),
      },
    })
  }
  return songIndices
}

export const getJacketPath = (id) => {
  const image = fs.readFileSync(path.join(process.cwd() + `/../../public/jackets/${id}.png`))
  return new Buffer(image).toString('base64')
}

const formatMissingDifficulties = (payload) => {
  const indexToDifficulty = ['bSP', 'BSP', 'DSP', 'ESP', 'CSP', 'BDP', 'DDP', 'EDP', 'CDP']
  if (!Array.isArray(payload.missingDifficulties)) {
    payload.missingDifficulties = (payload.missingDifficulties || '').split(',')
  }
  payload.missingDifficulties.forEach((val, i) => {
    // if a difficulty was marked as "missing" but the song actually does not have a chart
    // for this difficulty, it can be removed from `missingDifficulties`
    if (val !== null && !payload[indexToDifficulty[i]]) {
      payload.missingDifficulties[i] = null
    }
  })

  // once nonexistent difficulties have been nulled, filter out the nulls
  // then turn the remaining list into a comma-delimited string
  payload.missingDifficulties = payload.missingDifficulties.filter((i) => i !== null).join(',')
}

export const addSimfile = (payload) => {
  const { previousSongId } = payload

  formatMissingDifficulties(payload)

  const songList = getSimfilesTsv()

  // Parse simfiles.tsv into a json array and iterate through the songs.
  // Find the song corresponding to the previousSongId and make note of its index.
  // Construct the object for the newly added song and assign as its index the number
  // immediately following the index of the previous song.
  // Insert the new song object into the list in the position after the previous song.
  // Iterate through the rest of the song list and increment their indices by one each.
  let index = 0,
    newSongAdded = false

  // loop until previous song is reached/new song is added
  while (!newSongAdded) {
    const song = songList[index]
    if (song.hash === previousSongId) {
      // const previousSongIndex = +song.index;
      const newSongObj = {
        // index: previousSongIndex + 1,
        index: index + 1,
        hash: payload.hash,
        title: payload.title,
        smName: payload.smName,
        artist: payload.artist,
        version: payload.version,
        levels: payload.levels,
        displayBpm: payload.displayBpm,
        abcSort: payload.abcSort,
        dAudioUrl: payload.dAudioUrl,
        missingDifficulties: payload.missingDifficulties,
        useSsc: null,
        isLineout: payload.isLineout,
      }
      console.log(newSongObj)
      songList.splice(index + 1, 0, newSongObj)
      newSongAdded = true
      index += 2
    } else {
      index++
    }
  }
  // after new song has been added, loop until end of song list
  while (index < songList.length) {
    const song = songList[index]
    // song.index = +song.index + 1;
    song.index = index
    index++
  }

  saveJacket(payload)
  saveSimfile(payload)

  // return songList;
  const output = writeSimfileToTsv(songList)

  return output
}

export const updateSimfiles = (payload) => {
  const songList = getSimfilesTsv()

  formatMissingDifficulties(payload)

  const {
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
    isLineout,
    missingDifficulties,
    appOffset,
  } = payload

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
    isLineout,
    missingDifficulties: missingDifficulties || '',
    appOffset,
  }

  for (let i = 0; i < songList.length; i++) {
    if (songList[i].hash === hash) {
      songList[i] = { ...songList[i], ...newSongObj }
    }
  }

  if (payload.smUrl) {
    saveSimfile(payload)
  }

  const output = writeSimfileToTsv(songList)

  return output
}

// auto-save jacket to /public/jackets directory
const saveJacket = (json) => {
  request.get(
    {
      url: `https://p.eagate.573.jp/game/ddr/ddra20/p/images/binary_jk.html?img=${json.hash}&kind=1`,
      encoding: 'binary',
    },
    function (err, response, body) {
      const filePath = `${jacketPath}/${json.hash}.png`
      fs.writeFile(filePath, body, 'binary', function (err) {
        if (err) console.log(err)
        else console.log(`Jacket was saved to ${filePath}.`)
      })
    }
  )
}

// auto-save simfile to /public/simfiles directory
const saveSimfile = (json) => {
  request.get(
    {
      url: json.smUrl,
      encoding: 'utf-8',
    },
    function (err, response, body) {
      const filePath = `${simfilePath}/${json.smName}.sm`
      fs.writeFile(filePath, body, 'utf-8', function (err) {
        if (err) console.log(err)
        else console.log(`Simfile was saved to ${filePath}.`)
      })
    }
  )
}

const writeSimfileToTsv = (json) => {
  // write to simfiles.tsv
  let output = ''

  // console.log(json);
  const headers = Object.keys(json[0])

  console.log('headers', headers)

  output += headers.join('\t')

  json.forEach((song) => {
    let row = '\n'
    headers.forEach((header) => {
      let value = song[header]
      if (value === null || typeof value === 'undefined' || value === false) value = ''
      row += value + '\t'
    })
    output += row
  })

  // const testSimfileTsvPath = path.join(process.cwd(), "../../public/data/simfiles_test.tsv");

  fs.writeFile(simfileTsvPath, output, 'utf8', (err) => {
    if (err) console.log(err)
  })

  return output
}

/* APIs accessible from (locally running) A20Viewer app */
export const updateSongAppOffset = (songId, offset) => {
  const songList = getSimfilesTsv()
  offset = Math.round(offset * 100) / 100
  for (let i = 0; i < songList.length; i++) {
    if (songList[i].hash === songId) {
      songList[i].appOffset = offset
      console.log(songList[i])
    }
  }
  const output = writeSimfileToTsv(songList)

  return output
}
