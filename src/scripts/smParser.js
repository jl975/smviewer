const fs = require('fs')
const simfileDirectoryPath = '../../public/simfiles'
const chartLevels = require('../../public/data/chart_levels.json')

const getMetadataFromSM = (json) => {
  for (let i = 0; i < json.length; i++) {
    const song = json[i]
    const { smName } = song

    // console.log(song);
    let sm

    try {
      sm = fs.readFileSync(`${simfileDirectoryPath}/${smName}.sm`, 'utf-8')
    } catch (err) {
      continue
    }
    // console.log(sm);

    if (/#ARTIST:/i.test(sm)) {
      const artist = /#ARTIST:([\s\S]*?)\s*;/i.exec(sm)[1]
      song.artist = artist
    }

    if (/#SAMPLESTART:/i.test(sm)) {
      const sampleStart = /#SAMPLESTART:([\s\S]*?)\s*;/i.exec(sm)[1]
      song.sampleStart = parseFloat(sampleStart)
    }
    if (/#SAMPLELENGTH:/i.test(sm)) {
      const sampleLength = /#SAMPLELENGTH:([\s\S]*?)\s*;/i.exec(sm)[1]
      song.sampleLength = parseFloat(sampleLength)
    }

    // Display bpm
    if (/#DISPLAYBPM:/i.test(sm)) {
      let displayBpm = /#DISPLAYBPM:([\s\S]*?)\s*;/i.exec(sm)[1]
      displayBpm = displayBpm
        .split(':')
        .map((bpm) => parseInt(bpm))
        .join('-')
      // console.log(`${smName}: ${displayBpm}`);
      song.displayBpm = displayBpm
    } else {
      let bpm = /#BPMS:([\s\S]*?)\s*;/i.exec(sm)[1]
      bpm = bpm.split(',').map((point) => {
        point = point.split('=')
        return Math.round(parseFloat(point[1]))
      })
      let displayBpm = [Math.min(...bpm), Math.max(...bpm)]
      if (displayBpm[0] === displayBpm[1]) displayBpm = [displayBpm[0]]
      displayBpm = displayBpm.join('-')
      song.displayBpm = displayBpm
    }

    // Some simfile levels are inaccurate. Use official eAmuse data for these
    if (chartLevels[song.hash]) {
      song.levels = chartLevels[song.hash].levels
      console.log(`${song.title} ${song.levels}`)
    }
  }

  return json
}

module.exports = { getMetadataFromSM }
