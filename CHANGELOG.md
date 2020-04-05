## v0.3.0 - (unreleased)

- Implement guidelines
- Fixed simfile tsv reading issue that would often cause app to crash on page load
- Found solution for reliably keeping chart in sync with the audio
- Refactored arrow animation engine to greatly decrease chart processing times
- Shock arrow animation
- Initial mobile view implementation
- New song select UI with SDVX/DDRA-style 3 column jacket grid

## v0.2.0 - 2020-03-23

- Support for bpm changes and stops
- Rainbow/Vivid/Flat arrow colors
- Arrow color cycle animation
- Step zone flashing to the beat animation
- Marvelous flashes when the arrows reach the targets
- Held freeze animation
- Global offset of -12 ms to better approximate white cab timing
- Fixed several simfile parsing issues that were causing certain songs to crash

## v0.1.0 - 2020-03-20

- Dropdown of all songs available in DDR A20, linking to .ogg and .sm files hosted on ZiV
- Mods supported:
  - Speed: all the ones included in A20 Premium Play (0.25x through 8x)
  - Arrow color: Note
  - Turn: Off, Mirror, Left, Right, all 8 permutations of Shuffle (https://zenius-i-vanisher.com/v5.2/viewthread.php?threadid=3823)
- Parser for .sm files (.ssc not supported yet)
- Successful constant bpm playback of a complete chart using GSAP timeline. Does not yet support bpm changes and stops
- Implement freeze arrows and shock arrows
- Support playback of audio simultaneously with chart, with play/pause/restart capabilities
- Initial deploy to smviewer-herokuapp.com
