export const DEBUG_MODE = false

export const ARROW_WIDTH = 64
export const ARROW_HEIGHT = 64

export const STATIC_ARROW_WIDTH = 32
export const STATIC_ARROW_HEIGHT = 32

/* Height of one repetition of the freeze body pattern */
export const FREEZE_BODY_HEIGHT = 128

export const STATIC_FREEZE_BODY_HEIGHT = 64

/* Amount of pixels the Hidden+ and Sudden+ lane covers are moved with one nudge */
export const LANE_COVER_INCREMENT = 4

/* Width of the bpm reel or stop reel */
export const SIDE_REEL_WIDTH = 60

/* Screen breakpoints */
export const LANDSCAPE_MAX_HEIGHT = 420

export const PORTRAIT_NAVBAR_HEIGHT = 60
export const LANDSCAPE_NAVBAR_WIDTH = 64

export const DIRECTIONS = ['left', 'down', 'up', 'right']

export const ARROW_SHAPES = ['normal', 'classic', 'cyber', 'x']

/* 
  Offset of the visuals (i.e. chart, gsap timeline) relative to the audio.
  Positive value represents notes being earlier (have to hit earlier than the music)
  Negative value represents notes being later (have to hit later than the music)
*/
export const DEFAULT_OFFSET = 0.07
// export const DEFAULT_OFFSET = -0.1;  // oneplus

export const MARVELOUS_FLASH_FRAMES = 12

/* Number of beats played after the last note or event until the timeline ends */
export const END_EXTRA_BEATS = 8

/* Default cmod value; also serves as fallback speed if cmod form field value is invalid */
export const DEFAULT_CMOD = 500

export const DDR_VERSIONS = [
  'DDR 1st',
  'DDR 2ndMIX',
  'DDR 3rdMIX',
  'DDR 4thMIX',
  'DDR 5thMIX',
  'DDRMAX',
  'DDRMAX2',
  'DDR EXTREME',
  'DDR SuperNOVA',
  'DDR SuperNOVA 2',
  'DDR X',
  'DDR X2',
  'DDR X3 VS 2ndMIX',
  'DDR (2013)',
  'DDR (2014)',
  'DDR A',
  'DDR A20',
  'DDR A20 PLUS',
]

export const SP_DIFFICULTIES = ['Beginner', 'Basic', 'Difficult', 'Expert', 'Challenge']
export const DP_DIFFICULTIES = ['Basic', 'Difficult', 'Expert', 'Challenge']

/* Each number represents the lower bound of a range of bpm values, where the upper bound is
the next number (non-inclusive).
For example, 1 represents the range of bpms from 1 to 99 (i.e. BPM SORT ~100 in-game),
100 represents the range of bpms from 100 to 109 (BPM SORT 100~ in-game), etc.
300 represents all bpms 300 and up.
Bpm in this context refers to the MAX value of the song's DISPLAYED bpm. */
export const BPM_RANGES = [1, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 300]

/* Indices are chosen to match the genre filters' corresponding IDs on eagate. */
export const GENRES = [
  null,
  'Japanese Pops',
  'Anime & Game',
  'Variety',
  null,
  null,
  null,
  'HinaBitter',
  'Touhou Arrange',
  'Popular Songs',
  null,
  'Tokimeki Idol',
  'BandMeshi',
]

export const TITLE_CATEGORIES = [
  'あ',
  'か',
  'さ',
  'た',
  'な',
  'は',
  'ま',
  'や',
  'ら',
  'わ',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'NUM',
]

export const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]
