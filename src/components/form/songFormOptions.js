import {
  SP_DIFFICULTIES,
  TITLE_CATEGORIES,
  LEVELS,
  DDR_VERSIONS,
  BPM_RANGES,
  GENRES,
} from "../../constants";

export const titleSortOptions = [
  { key: "title_all", value: "all", text: "ALL" },
].concat(
  TITLE_CATEGORIES.map((letter) => {
    return { key: `title_${letter}`, value: letter, text: letter };
  })
);

export const versionSortOptions = [
  { key: "version_all", value: "all", text: "ALL" },
].concat(
  DDR_VERSIONS.map((versionName, idx) => {
    return { key: `version_${idx}`, value: idx, text: versionName };
  }).reverse()
);

export const levelSortOptions = [
  { key: "level_all", value: "all", text: "ALL" },
].concat(
  LEVELS.map((level) => {
    return { key: `level_${level}`, value: level, text: level };
  })
);

export const difficultySortOptions = [
  { key: "difficulty_all", value: "all", text: "ALL" },
].concat(
  SP_DIFFICULTIES.map((difficulty) => {
    return {
      key: `difficulty_${difficulty}`,
      value: difficulty,
      text: difficulty,
    };
  })
);

export const bpmRangeOptions = [
  { key: "bpm_all", value: "all", text: "ALL" },
].concat(
  BPM_RANGES.map((minBpm) => {
    return {
      key: `bpm_${minBpm}`,
      value: minBpm,
      text: minBpm === 1 ? "~ 100" : `${minBpm} ~`,
    };
  })
);
