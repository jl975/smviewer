const fs = require('fs')

const simfileTsvPath = '../../public/data/simfiles.tsv'

const { getMetadataFromSM } = require('./smParser')

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
      row[header] = value
    })
    output.push(row)
  }

  return output
}

const writeSimfileTsv = (json) => {
  let output = ''

  // console.log(json);
  const headers = Object.keys(json[0])

  output += headers.join('\t')

  json.forEach((song) => {
    let row = '\n'
    headers.forEach((header) => {
      let value = song[header]
      if (value === null) value = ''
      row += value + '\t'
    })
    output += row
  })

  fs.writeFile(simfileTsvPath, output, 'utf8', (err) => {
    if (err) console.log(err)
  })
}

const init = async () => {
  let parsedTsv = parseSimfileTsv()

  parsedTsv = getMetadataFromSM(parsedTsv)

  // console.log(parsedTsv);
  // console.log(chartLevels);

  // // one-time script of filling in empty smName and mp3 url columns
  // parsedTsv.forEach((song) => {
  //   song.version = hashVersion[song.hash].version;
  // });

  // const newColumns = getMp3AndSmColumns();
  // parsedTsv.forEach(song => {
  //   if (!song.smName) return;
  //   song.smName = song.smName.replace(".sm", "");
  //   for (let column of newColumns) {
  //     if (song.smName === column.smName) {
  //       song.dAudioUrl = column.dAudioUrl;
  //     }
  //   }
  // });

  await writeSimfileTsv(parsedTsv)
}

init()

/* one-time scripts for initial population of new columns */
// const hashVersion = require("./hash_version.json");

// const getMp3AndSmColumns = () => {
//   return fs
//     .readFileSync("dropbox_mp3_urls.txt", "utf-8")
//     .split("\n")
//     .map(url => {
//       const dAudioUrl = url
//         .replace(`https://www.dropbox.com/s/`, "")
//         .replace("?dl=0", "");
//       const smName = decodeURI(
//         dAudioUrl.slice(
//           dAudioUrl.indexOf("/") + 1,
//           dAudioUrl.indexOf("mp3") - 1
//         )
//       );

//       return { dAudioUrl, smName };
//     });
// };
