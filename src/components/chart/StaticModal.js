import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { Modal, Icon, Button } from 'semantic-ui-react'

import { capitalize } from '../../utils'
import { scaleCanvas } from '../../utils/canvasUtils'
import { STATIC_ARROW_HEIGHT, STATIC_ARROW_WIDTH } from '../../constants'
import { getChartLevel } from '../../utils/songUtils'
import { setModalOpen } from '../../actions/ScreenActions'
import AudioPlayer from '../../core/AudioPlayer'
import StaticArrow from './staticCanvas/StaticArrow'
import StaticShockArrow from './staticCanvas/staticShockArrow'
import StaticGuidelines from './staticCanvas/StaticGuidelines'
import HoldButton from '../ui/HoldButton'

const canvasScaleFactor = 0.5

// temp hardcode
const measuresPerColumn = 8
const beatsPerColumn = measuresPerColumn * 4

// const columnWidth = STATIC_ARROW_WIDTH * 4 * 2

const songDataSectionHeight = 50

const StaticModal = (props) => {
  const { modalOpen, setModalOpen, gameEngine, mode } = props

  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const songDataCanvasRef = useRef(null)
  const finalCanvasRef = useRef(null)

  const [canvasHeight, setCanvasHeight] = useState(0)
  const [canvasWidth, setCanvasWidth] = useState(0)
  const [canvasReady, setCanvasReady] = useState(false)

  const columnWidth = STATIC_ARROW_WIDTH * 4 * (mode === 'double' ? 3 : 2)

  const chartData = {
    title: props.song.title,
    difficulty: props.difficulty,
    mode: props.mode,
    level: getChartLevel(props.song, props.difficulty, props.mode),
  }

  useEffect(() => {
    if (!modalOpen) return
    // console.log(gameEngine.globalParams);

    const { bpmQueue, stopQueue } = gameEngine.globalParams

    const arrows = gameEngine.globalParams.arrows.map((arrow) => {
      return new StaticArrow(arrow)
    })

    const freezes = gameEngine.globalParams.freezes.map((freeze) => {
      return new StaticArrow(freeze)
    })

    const shocks = gameEngine.globalParams.shocks.map((shock) => {
      return new StaticShockArrow(shock)
    })

    let mods = gameEngine.globalParams.mods
    mods = JSON.parse(JSON.stringify(mods))

    const tick = { beatTick: 0, timeTick: 0 }

    mods.speed = 1

    const speedMod = mods.speed

    /*
      Use a temporarily hardcoded number of measures per column to figure out the
      height of the canvas. (1 measure @ 1x = 256px)
      Then calculate the number of columns required to draw every measure to figure out
      the width of the canvas. (The arrows take up 256px width for each column, and the
      space between each column takes up another 256px. So every column effectively takes
      up 512px width)
    */

    const finalBeat = gameEngine.globalParams.finalBeat
    const numMeasures = finalBeat / 4

    let calcCanvasHeight = STATIC_ARROW_HEIGHT * 4 * speedMod * measuresPerColumn
    calcCanvasHeight += STATIC_ARROW_HEIGHT // one arrow height worth of padding on bottom
    setCanvasHeight(calcCanvasHeight)

    const numColumns = Math.ceil(numMeasures / measuresPerColumn)

    const calcCanvasWidth = columnWidth * numColumns
    setCanvasWidth(calcCanvasWidth)

    setCanvasReady(true)

    // render the canvas
    let canvas = canvasRef.current

    // let canvas = document.createElement("canvas");
    if (!canvas) return

    let c = canvas.getContext('2d')

    // black background
    c.fillStyle = 'black'
    c.fillRect(0, 0, calcCanvasWidth, calcCanvasHeight)

    console.log('props', props)

    const directions = mode === 'double' ? [0, 1, 2, 3, 4, 5, 6, 7] : [0, 1, 2, 3]

    // draw each column
    for (let i = 0; i < numColumns; i++) {
      const columnStart = i * columnWidth + STATIC_ARROW_WIDTH * 2
      c.fillStyle = 'black'
      c.fillRect(columnStart, 0, STATIC_ARROW_WIDTH * 4, calcCanvasHeight)
      const guidelines = new StaticGuidelines(gameEngine.globalParams.finalBeat)
      guidelines.render(canvas, tick, {
        mods,
        mode,
        columnIdx: i,
        columnWidth: STATIC_ARROW_WIDTH * (mode === 'double' ? 8 : 4),
        measuresPerColumn,
        bpmQueue,
        stopQueue,
      })
    }

    for (let i = 0; i < shocks.length; i++) {
      const shock = shocks[i]
      shock.render(canvas, tick, {
        mods,
        mode,
        columnIdx: Math.floor(shock.beatstamp / beatsPerColumn),
        columnHeight: STATIC_ARROW_HEIGHT * 4 * speedMod * measuresPerColumn,
      })
    }

    for (let i = 0; i < freezes.length; i++) {
      const freeze = freezes[i]
      directions.forEach((directionIdx) => {
        freeze.renderFreezeBody(canvas, tick, directionIdx, {
          mods,
          mode,
          columnIdx: Math.floor(freeze.measureIdx / measuresPerColumn),
          columnHeight: STATIC_ARROW_HEIGHT * 4 * speedMod * measuresPerColumn,
          measuresPerColumn,
        })
      })
    }

    for (let i = 0; i < arrows.length; i++) {
      const arrow = arrows[i]
      directions.forEach((directionIdx) => {
        arrow.renderArrow(canvas, tick, directionIdx, {
          mods,
          mode,
          columnIdx: Math.floor(arrow.measureIdx / measuresPerColumn),
          columnHeight: STATIC_ARROW_HEIGHT * 4 * speedMod * measuresPerColumn,
          measuresPerColumn,
        })
      })
    }

    scaleCanvas(canvas, canvasScaleFactor)

    // render song data on second canvas
    canvas = songDataCanvasRef.current

    c = canvas.getContext('2d')
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvasWidth * canvasScaleFactor, songDataSectionHeight)

    c.font = '12px Arial'
    c.fillStyle = '#fff'

    let modsList = []
    modsList.push(`${mods.speed}x`)
    if (mods.turn !== 'off') {
      let turn = capitalize(mods.turn)
      if (mods.turn === 'shuffle')
        turn += `(${['LRDU', 'UDRL', 'LRUD', 'DURL', 'DLUR', 'DULR', 'RLUD', 'RULD'][mods.shuffle - 1]})`
      modsList.push(turn)
    }
    if (mods.scroll !== 'normal') modsList.push(capitalize(mods.scroll))

    if (mods.freezes === 'off') modsList.push('Freezes Off')
    if (mods.jumps === 'off') modsList.push('Jumps Off')

    c.fillText(chartData.title, 10, 14)
    c.fillText(`${capitalize(chartData.mode)} ${chartData.difficulty} ${chartData.level}`, 10, 28)
    c.fillText(`Mods: ${modsList.join(', ')}`, 10, 42)

    // final canvas
    canvas = finalCanvasRef.current
    c = canvas.getContext('2d')
    c.drawImage(songDataCanvasRef.current, 0, 0)
    c.drawImage(canvasRef.current, 0, songDataSectionHeight)

    canvasRef.current.remove()
    songDataCanvasRef.current.remove()
  }, [modalOpen, canvasHeight, canvasWidth])

  const onCanvasClick = (e) => {
    const canvasRect = finalCanvasRef.current.getBoundingClientRect()

    const leftEdge = STATIC_ARROW_WIDTH * 2 * canvasScaleFactor + canvasRect.x

    if (e.clientX < leftEdge) return

    const scaledColumnWidth = columnWidth * canvasScaleFactor

    const cx = (e.clientX - leftEdge) % scaledColumnWidth
    if (cx > scaledColumnWidth / 2) return

    const columnIdx = Math.floor((e.clientX - leftEdge) / scaledColumnWidth)

    const topEdge = (STATIC_ARROW_HEIGHT / 2) * canvasScaleFactor + canvasRect.y
    if (e.clientY < topEdge) return

    const cy = e.clientY - topEdge - songDataSectionHeight - 4

    const beatIdx = Math.floor(cy / (STATIC_ARROW_HEIGHT * canvasScaleFactor))

    if (beatIdx >= measuresPerColumn * 4) return

    const beatNum = columnIdx * measuresPerColumn * 4 + beatIdx

    // Figure out how to use the beat number to skip to the corresponding chart progress.
    const progressTs = seekProgress(beatNum)
    AudioPlayer.seekTime(progressTs)

    handleClose()
  }

  // Given a beat index, iterate through the arrows until the last arrow with a beatstamp earlier or
  // equal to the beat number is found. Then use that arrow's timestamp to skip to some chart
  // progress based on that timestamp.
  const seekProgress = (beatNum) => {
    const arrows = gameEngine.globalParams.allArrows
    for (let i = 0; i < arrows.length; i++) {
      const arrow = arrows[i]
      if (arrow.beatstamp > beatNum) {
        if (i - 1 >= 0) {
          return arrows[i - 1].timestamp
        } else {
          return arrow.timestamp
        }
      }
    }
    return arrows[arrows.length - 1].timestamp
  }

  const scrollIncrement = 5

  const scrollLeft = () => {
    const container = containerRef.current
    container.scrollLeft = Math.max(container.scrollLeft - scrollIncrement, 0)
  }
  const scrollRight = () => {
    const container = containerRef.current
    container.scrollLeft = Math.min(
      container.scrollLeft + scrollIncrement,
      container.scrollWidth - container.clientWidth
    )
  }

  // const showScrollButtons = () => {
  //   // const container = containerRef.current;
  //   const container = document.querySelector(".staticChart-container");
  //   console.log(container);
  //   if (!container) return false;
  //   console.log(container.clientWidth < container.scrollWidth);
  //   return container.clientWidth < container.scrollWidth;
  // };

  const handleOpen = () => {
    setModalOpen('staticChart', true)
  }
  const handleClose = async () => {
    await setModalOpen('staticChart', false)
    setCanvasReady(false)
    setCanvasHeight(0)
  }

  const saveAsImage = () => {
    const canvas = finalCanvasRef.current
    const dataUrl = canvas.toDataURL('image/png', 1.0)
    const a = document.createElement('a')
    a.href = dataUrl

    let filename = `${props.song.title} `
    filename += props.difficulty === 'Beginner' ? 'b' : props.difficulty.slice(0, 1)
    filename += props.mode.slice(0, 1).toUpperCase()
    filename += 'P.png'

    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  // const copyImage = () => {
  //   const canvas = finalCanvasRef.current;

  //   canvas.toBlob((blob) => navigator.clipboard.write([new window.ClipboardItem({ "image/png": blob })]));
  // };

  if (canvasReady) {
    return (
      <Modal className="staticModal" open={modalOpen} onOpen={handleOpen} onClose={handleClose}>
        <div className="staticChart-container" ref={containerRef}>
          <canvas ref={songDataCanvasRef} height={songDataSectionHeight} width={canvasWidth * canvasScaleFactor} />
          <canvas ref={canvasRef} height={canvasHeight} width={canvasWidth} onClick={onCanvasClick}></canvas>

          <canvas
            id="finalStaticChart"
            ref={finalCanvasRef}
            height={songDataSectionHeight + canvasHeight * canvasScaleFactor}
            width={canvasWidth * canvasScaleFactor}
            onClick={onCanvasClick}
          />

          <div className="top-actions">
            {/* {navigator.clipboard && window.ClipboardItem && (
              <Button className="action-button" onClick={copyImage}>
                <Icon name="copy" />
              </Button>
            )} */}
            <Button className="action-button" onClick={saveAsImage}>
              <Icon name="download" />
            </Button>
            <Button className="action-button close-icon" onClick={handleClose}>
              <Icon name="close" />
            </Button>
          </div>
          <div className={`scroll-buttons`}>
            <div className="scroll-buttons-wrapper">
              <HoldButton className="action-button scroll-left" onClick={scrollLeft}>
                <Icon name="angle left" />
              </HoldButton>
              <HoldButton className="action-button scroll-right" onClick={scrollRight}>
                <Icon name="angle right" />
              </HoldButton>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  return null
}

const mapStateToProps = (state) => {
  const { mods, songSelect, screen, simfiles } = state
  const { song, difficulty, mode } = songSelect
  return {
    mods,
    sm: simfiles.sm,
    song,
    difficulty,
    mode,
    screen,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StaticModal)
