import { DEBUG_MODE } from '../constants'

export const debugLog = (text, divNum = 1) => {
  if (!DEBUG_MODE) return
  const debugDiv = document.querySelector(`#debugLog .debug-text${divNum}`)
  if (debugDiv) {
    debugDiv.textContent = text
  }
}

export const debugLogView = (text, viewNum = 1) => {
  if (!DEBUG_MODE) return
  const debugDiv = document.querySelector(`#logView${viewNum}`)
  if (debugDiv) {
    debugDiv.textContent = text
  }
}

export const debugSimfileChart = (simfile) => {
  // console.log("DSC", simfile);
  const chart = simfile.chart
  // console.log(chart);

  let output = `${simfile.mode} ${simfile.difficulty} ${simfile.level}\n\n`

  const printChart = chart
    .map((row) => {
      if (!row.length) return '[    ]\n'
      let str = '['
      const numTicks = row[0].measureD

      for (let i = 0; i < numTicks; i++) {
        const tick = row.find((t) => +t.measureN === i)
        if (i > 0) str += ' '
        if (!tick) {
          // str += "    ";
          str += '0000'
        } else {
          // let lineOutput = "";
          // tick.note.split("").forEach((note, i) => {
          //   if (note == 0) lineOutput += " ";
          //   else if (note == 1) {
          //     if (i === 0) lineOutput += "L";
          //     else if (i === 1) lineOutput += "D";
          //     else if (i === 2) lineOutput += "U";
          //     else if (i === 3) lineOutput += "R";
          //   }
          // });
          // str += lineOutput;

          str += tick.note
        }
        if (i < numTicks - 1) str += '\n'
      }

      str += `] (${numTicks} ticks)\n`
      return str
    })
    .join('\n')
  output += printChart
  debugLogView(output, 1)
}
