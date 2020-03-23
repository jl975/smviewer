const modeRegex = /dance-([a-z]+)/;
const difficultyRegex = /(Beginner|Easy|Medium|Hard|Challenge)/;

const difficultyMap = {
  Beginner: "Beginner",
  Easy: "Basic",
  Medium: "Difficult",
  Hard: "Expert",
  Challenge: "Challenge",
};

const parseSimfile = sm => {
  const simfiles = {};

  let bpms = "";
  if (/#BPMS:/i.test(sm)) {
    bpms = /#BPMS:([\s\S]*?)\s*;/i.exec(sm)[1];
    if (bpms.length) {
      bpms = bpms.split(",").map(point => {
        const [beat, value] = point.split("=");
        return { beat: parseFloat(beat), value: parseFloat(value) };
      });
    } else {
      bpms = [];
    }
  }

  let stops = "";
  if (/#STOPS:/i.test(sm)) {
    stops = /#STOPS:([\s\S]*?)\s*;/i.exec(sm)[1];
    if (stops.length) {
      stops = stops.split(",").map(point => {
        const [beat, value] = point.split("=");
        return { beat: parseFloat(beat), value: parseFloat(value) };
      });
    } else {
      stops = [];
    }
  }

  const chartStrs = sm
    .slice(sm.indexOf("#NOTES:"))
    .split(/#NOTES:\s+/)
    .slice(1);

  chartStrs.forEach(chartStr => {
    const mode = modeRegex.exec(chartStr)[1]; // single or double

    let smDifficulty = difficultyRegex.exec(chartStr)[1];
    const difficulty = difficultyMap[smDifficulty];

    simfiles[`${mode}_${difficulty}`] = { difficulty, mode, bpms, stops };
    const simfile = simfiles[`${mode}_${difficulty}`];

    const levelRegex = new RegExp(`${smDifficulty}:\\s+([0-9]+):`);
    const level = parseInt(levelRegex.exec(chartStr)[1]);
    simfile.level = level;

    const measures = chartStr
      .slice(chartStr.lastIndexOf(":") + 1, chartStr.lastIndexOf(";"))
      .trim()
      .split(",")
      .map((measure, measureIdx) => {
        const ticks = measure
          .trim()
          .split("\r\n")
          .filter(n => !n.startsWith("//")); // filter out comment lines

        const numTicks = ticks.length;

        const noteObjects = [];
        ticks.forEach((tick, tickIdx) => {
          // skip empty ticks and comment lines
          if (!tick.split("").filter(n => n !== "0").length) return;

          const noteObj = {};
          noteObj.note = tick;
          noteObj.measureIdx = measureIdx; // index of the measure relative to the whole song (starting at 0)
          noteObj.measureN = tickIdx; // numerator of the fraction describing where note falls in this measure
          noteObj.measureD = numTicks; // denominator of the fraction describing where note falls in this measure

          noteObjects.push(noteObj);
        });

        return noteObjects;
      });
    simfile.chart = measures;
  });

  return simfiles;
};

export default parseSimfile;
