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
  if (sm.indexOf("#BPMS:") > -1) {
    bpms = /#BPMS:(.*?);/.exec(sm)[1];
    bpms = bpms.split(",").map(point => {
      const [beat, value] = point.split("=");
      return { beat: parseFloat(beat), value: parseFloat(value) };
    });
  }

  let stops = "";
  if (sm.indexOf("#STOPS:") > -1) {
    stops = /#STOPS:(.*?);/.exec(sm)[1];
    stops = stops.split(",").map(point => {
      const [beat, value] = point.split("=");
      return { beat: parseFloat(beat), value: parseFloat(value) };
    });
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
        const ticks = measure.trim().split("\r\n");
        const numTicks = ticks.length;

        const noteObjects = [];
        ticks.forEach((tick, tickIdx) => {
          // skip empty ticks
          if (!tick.split("").filter(n => n !== "0").length) return;

          const noteObj = {};
          noteObj.note = tick;
          // noteObj.beatValue = tickIdx / numTicks;

          noteObj.measureIdx = measureIdx; // index of the measure relative to the whole song (starting at 0)
          noteObj.measureN = tickIdx; // numerator of the fraction describing where note falls in this measure
          noteObj.measureD = numTicks; // denominator of the fraction describing where note falls in this measure

          noteObjects.push(noteObj);
        });

        // console.log(ticks, noteObjects);

        return noteObjects;
      });
    simfile.chart = measures;
  });

  return simfiles;
};

export default parseSimfile;
