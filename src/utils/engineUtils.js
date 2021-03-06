import { DEFAULT_OFFSET, ARROW_HEIGHT } from '../constants'
import store from '../store'

export const applyTurnMods = (chart, mods, mode) => {
  const { turn, shuffle } = mods

  // shuffle patterns courtesy of https://zenius-i-vanisher.com/v5.2/viewthread.php?threadid=3823
  const turnMap = {
    off: 'LDUR',
    mirror: 'RUDL',
    left: 'ULRD',
    right: 'DRLU',
    shuffle1: 'LRDU',
    shuffle2: 'UDRL',
    shuffle3: 'LRUD',
    shuffle4: 'DURL',
    shuffle5: 'DLUR',
    shuffle6: 'DULR',
    shuffle7: 'RLUD',
    shuffle8: 'RULD',
  }

  let turnMod = turn
  if (turn === 'shuffle') turnMod += shuffle

  if (mode === 'single') {
    return chart.map((row) => {
      const note = row.note
      const turnedNote = turnMap[turnMod].split('').map((direction) => note[turnMap.off.indexOf(direction)])

      return { ...row, note: turnedNote }
    })
  }
  if (mode === 'double') {
    return chart.map((row) => {
      let turnedNote = row.note.split('')
      if (turn === 'mirror') turnedNote = turnedNote.reverse()
      return { ...row, note: turnedNote }
    })
  }
}

export const applyAssistMods = (chart, mods) => {
  const { cut, freezes, jumps } = mods

  if (cut.includes('on')) {
    chart = chart.map((row) => {
      let modifiedNote = row.note
      const denom = cut === 'on2' ? 8 : 4
      if (row.measureN % (row.measureD / denom) !== 0) {
        modifiedNote = row.note.map((n) => {
          if (n === '1') return 'n'
          if (n === '2') return 'h'
          return n
        })
      }
      return { ...row, note: modifiedNote }
    })
  }
  if (freezes === 'off') {
    chart = chart.map((row) => {
      const modifiedNote = row.note.join('').replace(/2/g, '1').replace(/3/g, '0').split('')
      return { ...row, note: modifiedNote }
    })
  }
  if (jumps === 'off') {
    chart = chart.map((row) => {
      let modifiedNote = row.note

      let numTapNotes = 0
      row.note.forEach((n) => {
        if (n === '1' || n === '2') numTapNotes++
      })
      if (numTapNotes >= 2) {
        // replace freeze heads with 'h' so they can be detected by the corresponding tail notes as removed
        modifiedNote = row.note.map((n) => {
          if (n === '1') return 'n'
          if (n === '2') return 'h'
          return n
        })
      }
      return { ...row, note: modifiedNote }
    })
  }

  return chart
}

/*
  Given the bpmQueue and the current beat tick, find the latest bpm
  change event that happened before the current beat and set the current bpm
  to that bpm value. This should be invoked every time the audio is resynced
  (which will happen whenever progress is skipped)
*/
export const getCurrentBpm = (params) => {
  const { beatTick, bpmQueue } = params
  let lastBpmValue = 0
  for (let i = 0; i < bpmQueue.length; i++) {
    const bpmEvent = bpmQueue[i]
    if (bpmEvent.beat > beatTick) {
      return lastBpmValue
    }
    lastBpmValue = bpmEvent.value
  }
  return lastBpmValue
}

/*
  Get the global offset value
*/
export const getGlobalOffset = () => {
  return store.getState().mods.globalOffset
}

/*
  Change current displayed bpm. Going with direct DOM text manipulation
  rather than dispatching an action
*/
export const changeActiveBpm = (bpmValue, globalParams) => {
  const currentBpmEl = document.querySelector('.current-bpm-value')
  if (!currentBpmEl) return

  const { bpmQueue, beatTick, mods } = globalParams

  // Several charts start with an "offset" bpm on the first measure and are corrected
  // to the "real" bpm on the second measure. If the chart follows this pattern,
  // don't show the offset bpm as it can be very different and misleading
  if (beatTick < 4 && bpmQueue.length >= 2 && bpmQueue[0].beat === 0 && bpmQueue[1].beat === 4) {
    currentBpmEl.textContent = ''
  } else {
    // adjust bpm to reflect rate mod, if applicable
    currentBpmEl.textContent = Math.round(bpmValue * (mods.rate || 1))
    // asterisk to indicate that this is not the real bpm
    if (mods.rate !== 1) currentBpmEl.textContent += '*'
  }

  // console.log("globalParams", globalParams);
}

/*
  Find the current combo given the song timestamp. This should be invoked
  every time the audio is resynced.
*/

export const getCurrentPosition = (song) => {
  const { audio, globalParams } = song
  const { allArrows } = globalParams
  if (!allArrows.length) return 0

  const currentTime = audio.seek()

  // if audio is not properly loaded by the time this runs, currentTime will
  // return the Howl object, causing this method to return the full combo.
  // Return 0 instead in this case; seeing no combo is better than seeing
  // an incorrect full combo number

  // if (typeof currentTime !== "number") {
  //   return 0;
  // }

  const positionObj = {}
  let currentCombo, nextNotePtr

  // Go through the chart until the arrow following the current timestamp is reached,
  // then set the combo to one less than that arrow's combo
  for (let i = 0; i < allArrows.length; i++) {
    const arrow = allArrows[i]

    if (arrow.timestamp > currentTime + DEFAULT_OFFSET) {
      if (arrow.combo) {
        currentCombo = arrow.combo - 1
        positionObj.currentCombo = currentCombo
      }

      // only regular arrows and freeze heads count as "notes" for the purpose of assist tick
      if (arrow.note.includes('1') || arrow.note.includes('2')) {
        nextNotePtr = i
        positionObj.nextNotePtr = nextNotePtr
      }

      if (typeof positionObj.currentCombo !== 'undefined' && typeof positionObj.nextNotePtr !== 'undefined') {
        return positionObj
      }
    }
  }

  // If end of chart is reached, use the combo of the last arrow.
  // Need to go back if the last "note" is the end of a freeze, which is common
  // Expected to short circuit out of loop after ~1-2 iterations
  for (let i = allArrows.length - 1; i >= 0; i--) {
    const arrow = allArrows[i]
    if (arrow.combo) {
      currentCombo = arrow.combo
      return { currentCombo, nextNotePtr: null }
    }
  }

  return { currentCombo: -1 } // should never reach this. return -1 to make debugging easier
}

export const getFullCombo = (song) => {
  const { globalParams } = song
  const { allArrows } = globalParams
  if (!allArrows.length) return 0
  for (let i = allArrows.length - 1; i >= 0; i--) {
    const arrow = allArrows[i]
    if (arrow.combo) {
      return arrow.combo
    }
  }
  return 0
}

/*
  Method for finding the coordinate of a sprite on Reverse scroll
  given the corresponding coordinate on Normal scroll and its height
*/
export const getReverseCoord = (originalCoord, height, canvas) => {
  return canvas.height - (originalCoord + height)
}

/* Remove all bpm/stop display elements from the DOM */
export const clearBpmAndStopDisplay = () => {
  const bpmReel = document.getElementById('bpmReel')
  if (bpmReel) {
    bpmReel.innerHTML = ''
    // console.log("cleared bpm reel", bpmReel);
  }
  const stopReel = document.getElementById('stopReel')
  if (stopReel) {
    stopReel.innerHTML = ''
    // console.log("cleared stop reel", stopReel);
  }
}

/*
  Based on the current beat tick, calculates the index of the first
  arrow to fall within the visible beat window
*/
export const initializeBeatWindow = (globalParams) => {
  const { arrows, freezes, shocks, chartAreaHeight, mBpm, mods } = globalParams

  let timestamp = mods.speed === 'cmod' ? 'timestamp' : 'beatstamp'

  const bpmStopEvents = ['bpm', 'stop']

  // calculate number of beats (on 1x scroll) covered by the visible chart area
  // = number of arrow heights that can fit on screen + 1 extra arrow height on top and bottom
  // then divided by the scroll speed mod
  // let numVisibleBeats = (chartAreaHeight + ARROW_HEIGHT) / ARROW_HEIGHT;

  let windowStart, windowEnd

  if (mods.speed === 'cmod') {
    let visibleTime = chartAreaHeight / ARROW_HEIGHT
    visibleTime /= mods.cmod / 60
    windowStart = globalParams.timeTick - 1 / (mods.cmod / 60)
    windowEnd = globalParams.timeTick + visibleTime
  } else {
    let numVisibleBeats = chartAreaHeight / ARROW_HEIGHT
    let speedMod = mods.speed
    if (mods.speed === 'mmod') {
      speedMod = mods.cmod / mBpm
    }

    numVisibleBeats /= speedMod
    windowStart = globalParams.beatTick - 1 / speedMod
    windowEnd = globalParams.beatTick + numVisibleBeats
  }

  const windowStartPtr = {}
  const windowEndPtr = {}

  // if no arrows have passed yet (or none exist), set pointer to beginning
  if (!arrows.length || arrows[0][timestamp] > windowStart) {
    windowStartPtr.arrow = 0
  }
  // if no more arrows left
  else if (arrows[arrows.length - 1][timestamp] < windowStart) {
    windowStartPtr.arrow = arrows.length
  }
  // if at least one arrow has passed, find the topmost arrow that has yet to pass
  // binary search would be ideal. for now, just use an ordinary O(n) search
  else {
    for (let i = 1; i < arrows.length; i++) {
      const previousArrow = arrows[i - 1]
      const currentArrow = arrows[i]

      // return the index of the first arrow that lies on or after the current beat tick
      if (previousArrow[timestamp] < windowStart && currentArrow[timestamp] >= windowStart) {
        windowStartPtr.arrow = i
        break
      }
    }
  }

  // start pointer for shock arrows
  if (!shocks.length || shocks[0][timestamp] > windowStart) {
    windowStartPtr.shock = 0
  } else if (shocks[shocks.length - 1][timestamp] < windowStart) {
    windowStartPtr.shock = shocks.length
  } else {
    for (let i = 1; i < shocks.length; i++) {
      if (shocks[i - 1][timestamp] < windowStart && shocks[i][timestamp] >= windowStart) {
        windowStartPtr.shock = i
        break
      }
    }
  }

  // start pointer for bpm/stop values
  bpmStopEvents.forEach((event) => {
    const events = globalParams[`${event}Queue`]
    const ts = mods.speed === 'cmod' ? 'timestamp' : 'beat'
    if (!events.length || events[0][ts] > windowStart) {
      windowStartPtr[event] = 0
    } else if (events[events.length - 1][ts] < windowStart) {
      windowStartPtr[event] = events.length
    } else {
      for (let i = 1; i < events.length; i++) {
        if (events[i - 1][ts] < windowStart && events[i][ts] >= windowStart) {
          windowStartPtr[event] = i
          break
        }
      }
    }
  })

  // find start pointer for freeze bodies. copy of above logic for regular arrows
  if (!freezes.length || freezes[0][timestamp] > windowStart) {
    windowStartPtr.freeze = 0
  } else if (freezes[freezes.length - 1][timestamp] < windowStart) {
    windowStartPtr.freeze = freezes.length
  } else {
    for (let i = 1; i < freezes.length; i++) {
      if (freezes[i - 1][timestamp] < windowStart && freezes[i][timestamp] >= windowStart) {
        windowStartPtr.freeze = i
        break
      }
    }
  }

  // repeat for end pointer

  // if there are no arrows on screen and the next "top arrow" is pointing to an arrow
  // that has yet to appear, point the next "bottom arrow" to the arrow BEFORE the top arrow.
  // This replicates the way the pointers naturally update when the screen reaches a section
  // with no visible arrows, essentially meaning there are no arrows to iterate over and render

  let nextTopArrow = arrows[windowStartPtr.arrow]

  // short-circuit if chart is over or if no arrows are on screen
  if (windowStartPtr.arrow >= arrows.length || nextTopArrow[timestamp] > windowEnd) {
    windowEndPtr.arrow = windowStartPtr.arrow - 1
  }

  // if at least one arrow is on screen
  else {
    for (let j = windowStartPtr.arrow; j < arrows.length; j++) {
      const currentArrow = arrows[j]
      const nextArrow = arrows[j + 1]

      // if there is no next arrow, the end has been reached
      if (!nextArrow) {
        windowEndPtr.arrow = j
        break
      } else if (currentArrow[timestamp] <= windowEnd && nextArrow[timestamp] > windowEnd) {
        windowEndPtr.arrow = j
        break
      }
    }
  }

  // end pointer for shock arrows
  let nextTopShock = shocks[windowStartPtr.shock]
  if (windowStartPtr.shock >= shocks.length || nextTopShock[timestamp] > windowEnd) {
    windowEndPtr.shock = windowStartPtr.shock - 1
  } else {
    for (let i = windowStartPtr.shock; i < shocks.length; i++) {
      const currentShock = shocks[i]
      const nextShock = shocks[i + 1]
      if (!nextShock || (currentShock[timestamp] <= windowEnd && nextShock[timestamp] > windowEnd)) {
        windowEndPtr.shock = i
        break
      }
    }
  }

  // end pointer for bpm/stop values
  bpmStopEvents.forEach((event) => {
    const events = globalParams[`${event}Queue`]
    const ts = mods.speed === 'cmod' ? 'timestamp' : 'beat'
    let nextTopEvent = events[windowStartPtr[event]]
    if (windowStartPtr[event] >= events.length || nextTopEvent[ts] > windowEnd) {
      windowEndPtr[event] = windowStartPtr[event] - 1
    } else {
      for (let i = windowStartPtr[event]; i < events.length; i++) {
        const currentEvent = events[i]
        const nextEvent = events[i + 1]
        if (!nextEvent || (currentEvent[ts] <= windowEnd && nextEvent[ts] > windowEnd)) {
          windowEndPtr[event] = i
          break
        }
      }
    }
  })

  const holdEnds = mods.speed === 'cmod' ? 'holdEndTimes' : 'holdEndBeats'

  // find end pointer for freeze bodies
  let nextTopFreeze = freezes[windowStartPtr.freeze]
  if (windowStartPtr.freeze >= freezes.length) {
    windowEndPtr.freeze = windowStartPtr.freeze - 1
  }

  // if the next top arrow is off screen
  else if (nextTopFreeze[timestamp] > windowEnd) {
    windowEndPtr.freeze = windowStartPtr.freeze - 1

    // if the off-screen arrow is in the middle of (or part of) a freeze,
    // increment the end pointer until it matches the latest hold end (which could either
    // be part of itself or part of an adjacent freeze arrow)
    if (nextTopFreeze[holdEnds]) {
      const latestHoldEnd = Math.max(...nextTopFreeze[holdEnds].filter((a) => a))
      windowEndPtr.freeze = windowStartPtr.freeze
      while (freezes[windowEndPtr.freeze][timestamp] < latestHoldEnd) windowEndPtr.freeze++
    }
  }
  // if at least one arrow is on screen
  else {
    for (let i = windowStartPtr.freeze; i < freezes.length; i++) {
      const currentFreeze = freezes[i]
      const nextFreeze = freezes[i + 1]

      if (!nextFreeze) {
        windowEndPtr.freeze = i
        break
      }
      // if the last visible arrow is in the middle of (or part of) a freeze,
      // increment the end pointer until it matches the latest holdEndBeat (which could either
      // be part of itself or part of an adjacent freeze arrow)
      else if (currentFreeze[timestamp] <= windowEnd && nextFreeze[timestamp] > windowEnd) {
        if (currentFreeze[holdEnds]) {
          const latestHoldEnd = Math.max(...currentFreeze[holdEnds].filter((a) => a))

          while (freezes[i][timestamp] < latestHoldEnd) i++
        }
        windowEndPtr.freeze = i
        break
      }
    }
  }

  if (mods.speed === 'cmod') {
    globalParams.timeWindowStartPtr = windowStartPtr
    globalParams.timeWindowEndPtr = windowEndPtr
    globalParams.currentTimeWindow = [windowStart, windowEnd]
  } else {
    globalParams.beatWindowStartPtr = windowStartPtr
    globalParams.beatWindowEndPtr = windowEndPtr
    globalParams.currentBeatWindow = [windowStart, windowEnd]
  }

  // globalParams.currentBeatWindow = currentBeatWindow;

  // console.log("initialize beat window", currentBeatWindow);
}

/*
  Assuming the beat pointer is already defined, invoke this method on every subsequent
  frame to incrementally update the window values and determine if the pointer needs
  to be shifted
*/
export const updateBeatWindow = (globalParams) => {
  const { arrows, freezes, shocks, chartAreaHeight, mBpm, mods } = globalParams

  const bpmStopEvents = ['bpm', 'stop']

  let windowStartPtr, windowEndPtr, timestamp
  if (mods.speed === 'cmod') {
    windowStartPtr = globalParams.timeWindowStartPtr
    windowEndPtr = globalParams.timeWindowEndPtr
    timestamp = 'timestamp'
  } else {
    windowStartPtr = globalParams.beatWindowStartPtr
    windowEndPtr = globalParams.beatWindowEndPtr
    timestamp = 'beatstamp'
  }

  if (
    typeof windowStartPtr === 'undefined' ||
    typeof windowEndPtr === 'undefined' ||
    !Object.keys(windowStartPtr).length ||
    !Object.keys(windowEndPtr).length
  )
    return

  // calculate number of beats (on 1x scroll) covered by the visible chart area
  // = number of arrow heights that can fit on screen + 1 extra arrow height on top and bottom
  // then divided by the scroll speed mod
  // let numVisibleBeats = (chartAreaHeight + ARROW_HEIGHT) / ARROW_HEIGHT;
  let windowStart, windowEnd
  if (mods.speed === 'cmod') {
    let visibleTime = chartAreaHeight / ARROW_HEIGHT
    visibleTime /= mods.cmod / 60
    windowStart = globalParams.timeTick - 1 / (mods.cmod / 60)
    windowEnd = globalParams.timeTick + visibleTime
    globalParams.currentTimeWindow = [windowStart, windowEnd]
  } else {
    let numVisibleBeats = chartAreaHeight / ARROW_HEIGHT
    let speedMod = mods.speed
    if (mods.speed === 'mmod') {
      speedMod = mods.cmod / mBpm
    }

    numVisibleBeats /= speedMod
    windowStart = globalParams.beatTick - 1 / speedMod
    windowEnd = globalParams.beatTick + numVisibleBeats
    globalParams.currentBeatWindow = [windowStart, windowEnd]
  }

  // short-circuit if chart is over
  if (windowStartPtr.arrow === arrows.length) return

  // if chart is just beginning, watch for the first arrow (unless it is a freeze)
  // short-circuit if it has not begun
  if (windowEndPtr.arrow === -1) {
    // if the first arrow has finally appeared, set the end ptr
    if (arrows[0][timestamp] <= windowEnd) {
      windowEndPtr.arrow = 0
    }
  }

  // watch for first shock if applicable
  if (shocks.length && windowEndPtr.shock === -1 && shocks[0][timestamp] <= windowEnd) {
    windowEndPtr.shock = 0
  }

  // watch for first bpm change/stop
  bpmStopEvents.forEach((event) => {
    const events = globalParams[`${event}Queue`]
    const ts = mods.speed === 'cmod' ? 'timestamp' : 'beat'
    if (events.length && windowEndPtr[event] === -1 && events[0][ts] <= windowEnd) {
      windowEndPtr[event] = 0
    }
  })

  // Watching top arrow
  //
  // if there are arrows on the screen, and the topmost arrow from the previous frame is
  // now behind the updated windowStart
  const topmostArrow = arrows[windowStartPtr.arrow]

  let nextTopArrow = topmostArrow

  // topmost arrow is no longer the topmost arrow when it is behind windowStart
  while (nextTopArrow[timestamp] < windowStart) {
    windowStartPtr.arrow++

    // no more arrows left
    if (windowStartPtr.arrow >= arrows.length) return

    nextTopArrow = arrows[windowStartPtr.arrow]
  }

  // watching top shock arrow
  let nextTopShock = shocks[windowStartPtr.shock]
  while (nextTopShock && nextTopShock[timestamp] < windowStart) {
    windowStartPtr.shock++
    nextTopShock = shocks[windowStartPtr.shock]
  }

  // watch for first bpm change/stop
  bpmStopEvents.forEach((event) => {
    const events = globalParams[`${event}Queue`]
    const ts = mods.speed === 'cmod' ? 'timestamp' : 'beat'
    let nextTopEvent = events[windowStartPtr[event]]
    while (nextTopEvent && nextTopEvent[ts] < windowStart) {
      windowStartPtr[event]++
      nextTopEvent = events[windowStartPtr[event]]
    }
  })

  // watching top freeze arrow
  let nextTopFreeze = freezes[windowStartPtr.freeze]
  while (nextTopFreeze && nextTopFreeze[timestamp] < windowStart) {
    windowStartPtr.freeze++
    nextTopFreeze = freezes[windowStartPtr.freeze]
  }

  // Watching bottom arrow
  //
  // if there are arrows on the screen, and the arrow AFTER the bottommost arrow from the previous
  // frame is now behind the updated windowEnd
  let nextBottomArrowAdj = arrows[windowEndPtr.arrow + 1]

  // bottommost arrow is no longer bottommost arrow when the next arrow is behind windowEnd
  while (nextBottomArrowAdj && nextBottomArrowAdj[timestamp] <= windowEnd) {
    windowEndPtr.arrow++
    nextBottomArrowAdj = arrows[windowEndPtr.arrow + 1]
  }

  // watching bottom shock arrow
  let nextBottomShockAdj = shocks[windowEndPtr.shock + 1]
  while (nextBottomShockAdj && nextBottomShockAdj[timestamp] <= windowEnd) {
    windowEndPtr.shock++
    nextBottomShockAdj = shocks[windowEndPtr.shock + 1]
  }

  // watch for first bpm change/stop
  bpmStopEvents.forEach((event) => {
    const events = globalParams[`${event}Queue`]
    const ts = mods.speed === 'cmod' ? 'timestamp' : 'beat'
    let nextBottomEventAdj = events[windowEndPtr[event] + 1]
    while (nextBottomEventAdj && nextBottomEventAdj[ts] <= windowEnd) {
      windowEndPtr[event]++
      nextBottomEventAdj = events[windowEndPtr[event] + 1]
    }
  })

  // watching bottom freeze arrow
  let nextBottomFreeze = freezes[windowEndPtr.freeze]
  let nextBottomFreezeAdj = freezes[windowEndPtr.freeze + 1]
  while (nextBottomFreezeAdj && nextBottomFreezeAdj[timestamp] <= windowEnd) {
    windowEndPtr.freeze++
    nextBottomFreeze = freezes[windowEndPtr.freeze]
    nextBottomFreezeAdj = freezes[windowEndPtr.freeze + 1]
  }

  // extend the freeze window to reach the latest hold end
  if (nextBottomFreeze) {
    const holdEnds = mods.speed === 'cmod' ? 'holdEndTimes' : 'holdEndBeats'
    const latestHoldEnd = Math.max(...nextBottomFreeze[holdEnds].filter((a) => a))
    while (freezes[windowEndPtr.freeze][timestamp] < latestHoldEnd) {
      windowEndPtr.freeze++
    }
  }

  // ^ because a freeze tail happening simultaneously as the head of a different freeze
  // are counted as the same note, if the end pointer falls on such a note, the above code cannot
  // tell whether it is referring to the former's tail or the latter's head.
  // therefore, it will result in the beat window being extended all the way down to the end of
  // any "freeze chain", including any freezes that are not yet visible on the screen in any form.
  // this makes the engine loop over slightly more arrows than necessary, but this is fine for now

  // const allArrowsInWindow = [];
  // for (
  //   let i = globalParams.windowStartPtr.freeze;
  //   i <= globalParams.windowEndPtr.freeze;
  //   i++
  // ) {
  //   allArrowsInWindow.push(i);
  // }
  // console.log(allArrowsInWindow);

  if (mods.speed === 'cmod') {
    globalParams.timeWindowStartPtr = windowStartPtr
    globalParams.timeWindowEndPtr = windowEndPtr
  } else {
    globalParams.beatWindowStartPtr = windowStartPtr
    globalParams.beatWindowEndPtr = windowEndPtr
  }
}
