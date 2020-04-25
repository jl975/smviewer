const modeRegex = /dance-([a-z]+)/;
const difficultyRegex = /(Beginner|Easy|Medium|Hard|Challenge|Edit)/;

const difficultyMap = {
  Beginner: "Beginner",
  Easy: "Basic",
  Medium: "Difficult",
  Hard: "Expert",
  Challenge: "Challenge",
};

const parseSimfile = (sm, simfileType = "sm") => {
  const simfiles = {};

  const chartMetadata = sm.slice(
    0,
    sm.indexOf(simfileType === "ssc" ? "#NOTEDATA:" : "#NOTES:")
  );

  let bpms = [];
  let stops = [];

  // default bpms
  if (/#BPMS:/i.test(chartMetadata)) {
    bpms = /#BPMS:([\s\S]*?)\s*;/i.exec(chartMetadata)[1];
    if (bpms.length) {
      bpms = bpms.split(",").map((point) => {
        const [beat, value] = point.split("=");
        return { beat: parseFloat(beat), value: parseFloat(value) };
      });
    }
  }
  // default stops
  if (/#STOPS:/i.test(chartMetadata)) {
    stops = /#STOPS:([\s\S]*?)\s*;/i.exec(chartMetadata)[1];
    if (stops.length) {
      stops = stops.split(",").map((point) => {
        const [beat, value] = point.split("=");
        return { beat: parseFloat(beat), value: parseFloat(value) };
      });
    }
  }

  let chartStrs;

  if (simfileType === "ssc") {
    chartStrs = sm
      .slice(sm.indexOf("#NOTEDATA:"))
      .split(/#NOTEDATA:\s*;/)
      .slice(1);
  } else {
    chartStrs = sm
      .slice(sm.indexOf("#NOTES:"))
      .split(/#NOTES:\s+/)
      .slice(1);
  }

  chartStrs.forEach((chartStr) => {
    const mode = modeRegex.exec(chartStr)[1]; // single or double

    let smDifficulty = difficultyRegex.exec(chartStr)[1];
    const difficulty = difficultyMap[smDifficulty];

    simfiles[`${mode}_${difficulty}`] = { difficulty, mode, bpms, stops };
    const simfile = simfiles[`${mode}_${difficulty}`];

    let level;
    if (simfileType === "ssc") {
      level = /#METER:([0-9]+);/.exec(chartStr)[1];
    } else {
      const levelRegex = new RegExp(`${smDifficulty}:\\s+([0-9]+):`);
      level = parseInt(levelRegex.exec(chartStr)[1]);
    }
    simfile.level = level;

    if (simfileType === "ssc") {
      // check for different bpms
      if (/#BPMS:/i.test(chartStr)) {
        bpms = /#BPMS:([\s\S]*?)\s*;/i.exec(chartStr)[1];
        if (bpms.length) {
          bpms = bpms.split(",").map((point) => {
            const [beat, value] = point.split("=");
            return { beat: parseFloat(beat), value: parseFloat(value) };
          });
          simfile.bpms = bpms;
        }
      }

      // check for different stops
      if (/#STOPS:/i.test(chartStr)) {
        stops = /#STOPS:([\s\S]*?)\s*;/i.exec(chartStr)[1];
        if (stops.length) {
          stops = stops.split(",").map((point) => {
            const [beat, value] = point.split("=");
            return { beat: parseFloat(beat), value: parseFloat(value) };
          });
          simfile.stops = stops;
        }
      }
    }

    const measures = chartStr
      .slice(chartStr.lastIndexOf(":") + 1, chartStr.lastIndexOf(";"))
      .trim()
      .split(",")
      .map((measure, measureIdx) => {
        const ticks = measure
          .trim()
          .split("\r\n")
          .filter((n) => !n.startsWith("//")); // filter out comment lines

        const numTicks = ticks.length;

        const noteObjects = [];
        ticks.forEach((tick, tickIdx) => {
          // skip empty ticks and comment lines
          if (!tick.split("").filter((n) => n !== "0").length) return;

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
