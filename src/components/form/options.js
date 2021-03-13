import { presetParams } from '../../utils'
import { DEFAULT_CMOD, DEFAULT_OFFSET } from '../../constants'
import { getUserSettings } from '../../utils/userSettings'

export const options = {
  difficulty: ['Beginner', 'Basic', 'Difficult', 'Expert', 'Challenge'],
  mode: ['single', 'double'],
  mods: {
    speed: [
      0.25,
      0.5,
      0.75,
      1,
      1.25,
      1.5,
      1.75,
      2,
      2.25,
      2.5,
      2.75,
      3,
      3.25,
      3.5,
      3.75,
      4,
      4.5,
      5,
      5.5,
      6,
      6.5,
      7,
      7.5,
      8,
    ],
    rate: [0.5, 0.8, 1, 1.2, 1.5],
    appearance: ['visible', 'hidden', 'sudden', 'hiddensudden', 'stealth'],
    turn: ['off', 'mirror', 'left', 'right', 'shuffle'],
    shuffle: [1, 2, 3, 4, 5, 6, 7, 8],
    stepZone: ['on', 'off'],
    scroll: ['normal', 'reverse'],
    noteskin: ['rainbow', 'note', 'vivid', 'flat'],
    comboDisplay: ['behind', 'inFront', 'hidden'],
    comboFont: ['A20', 'A'],
  },
}

// Default values when user opens app for the first time
const optionDefaultValues = {
  difficulty: 'Expert',
  mode: 'single',
  mods: {
    speed: 2.5,
    cmod: DEFAULT_CMOD,
    rate: 1,
    appearance: 'visible',
    laneCoverHeight: [8, 8, 8],
    laneCoverVisible: true,
    turn: 'off',
    shuffle: 1,
    stepZone: 'on',
    scroll: 'normal',
    noteskin: 'note',
    guidelines: true,
    comboDisplay: 'behind',
    comboFont: 'A20',
    assistTick: false,
    colorFreezes: false,
    globalOffset: DEFAULT_OFFSET,
    bpmStopDisplay: false,
    preconfirmOffset: null,
  },
}

export const generateInitialValues = (params = presetParams) => {
  // Values stored in localStorage user settings override default values
  const userSettings = getUserSettings()
  ;['song', 'difficulty', 'mode'].forEach((key) => {
    if (userSettings[key]) {
      optionDefaultValues[key] = userSettings[key]
    }
  })

  if (userSettings.mods) {
    Object.keys(optionDefaultValues.mods).forEach((mod) => {
      if (typeof userSettings.mods[mod] !== 'undefined') {
        optionDefaultValues.mods[mod] = userSettings.mods[mod]
      }
    })
  }

  // Preset params in the url override default values AND user settings
  if (params.difficulty) {
    const difficulties = {
      b: 'Beginner',
      B: 'Basic',
      D: 'Difficult',
      E: 'Expert',
      C: 'Challenge',
    }
    if (Object.keys(difficulties).includes(params.difficulty[0])) {
      optionDefaultValues.difficulty = difficulties[params.difficulty[0]]
    }
    if (params.difficulty[1] === 'S') {
      optionDefaultValues.mode = 'single'
    } else if (params.difficulty[1] === 'D') {
      optionDefaultValues.mode = 'double'
    }
  }
  if (params.speed) {
    const value = parseFloat(`${params.speed[0]}.${params.speed.slice(1)}`)
    if (options.mods.speed.includes(value)) {
      optionDefaultValues.mods.speed = value
    }
  }
  if (params.turn) {
    const turnValue = params.turn.toLowerCase()
    if (options.mods.turn.includes(turnValue)) {
      optionDefaultValues.mods.turn = turnValue
    }
  }

  return optionDefaultValues
}
generateInitialValues(presetParams)

export { optionDefaultValues }
