import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { Button } from 'semantic-ui-react'
import 'inobounce'

import { ARROW_WIDTH, SIDE_REEL_WIDTH, LANDSCAPE_MAX_HEIGHT } from '../../constants'
import { presetParams, getJacketPath, noop } from '../../utils'
import parseSimfile from '../../utils/parseSimfile'
import { usePrevious } from '../../hooks'
import { setModalOpen } from '../../actions/ScreenActions'
import GameEngine from '../../core/GameEngine'
import AudioPlayer from '../../core/AudioPlayer'
import ShareModal from '../share/ShareModal'
import Progress from './canvas/Progress'
import PlayControls from './PlayControls'
import SongInfo from './SongInfo'
import StaticModal from './StaticModal'

import CabButtons from './CabButtons'
import BpmDisplay from './BpmDisplay'
import StopDisplay from './StopDisplay'
import ModDisplay from './ModDisplay'

const ChartArea = (props) => {
  const { selectedDifficulty, selectedMode, selectedSong, sm, mods, screen, loadingAudio, gameEngine, setGameEngine } =
    props

  const [mounted, setMounted] = useState(false)
  const [canvas, setCanvas] = useState(null)
  const chartArea = useRef()
  const canvasContainer = useRef()
  const canvasWrapper = useRef()
  const chartLoadingScreen = useRef()

  const prevState = usePrevious({
    canvas,
    sm,
    selectedDifficulty,
    selectedMode,
    mods,
    mounted,
  })

  // define canvas and resize listener on mount
  useEffect(() => {
    chartArea.current = document.querySelector('#chartArea')
    setCanvas(chartArea.current)

    Progress.initCanvas()
    setMounted(true)
  }, [])

  // change chart dimensions depending on single or double
  // Hardcoded heights for now. Variable heights may be possible in the future
  useEffect(() => {
    if (!canvas || !canvasContainer.current) return
    resizeChartArea()
  }, [canvas, selectedMode, screen])

  const resizeChartArea = () => {
    noop()

    // landscape orientation
    if (window.innerHeight <= LANDSCAPE_MAX_HEIGHT) {
      const subChartAreaHeight = 60

      canvasWrapper.current.style.transform = 'none'

      if (selectedMode === 'single') {
        chartArea.current.width = ARROW_WIDTH * 4
      } else if (selectedMode === 'double') {
        chartArea.current.width = ARROW_WIDTH * 8
      }

      canvasContainer.current.style.height = `${window.innerHeight - subChartAreaHeight}px`
      const scaleFactor = (window.innerHeight - subChartAreaHeight) / 448
      canvasContainer.current.style.transform = `scale(${scaleFactor})`
    }
    // portrait orientation
    else {
      if (selectedMode === 'single') {
        chartArea.current.width = ARROW_WIDTH * 4
        canvasWrapper.current.style.transform = 'none'
      } else if (selectedMode === 'double') {
        chartArea.current.width = ARROW_WIDTH * 8

        const wrapper = canvasContainer.current

        if (wrapper.clientWidth < ARROW_WIDTH * 8 + SIDE_REEL_WIDTH * 2) {
          const scaleFactor = Math.min(wrapper.clientWidth / chartArea.current.width, 1)
          canvasWrapper.current.style.transform = `scale(${scaleFactor})`
          console.log('scaleFactor', scaleFactor)
        } else {
          canvasWrapper.current.style.transform = 'none'
        }
      }

      canvasContainer.current.style.height = '436px'
      canvasContainer.current.style.transform = 'none'
    }
    if (gameEngine) {
      gameEngine.updateLoopOnce()
    }
  }

  // reset chart if mode, difficulty, or mods change
  useEffect(() => {
    const currentState = { canvas, sm, selectedDifficulty, selectedMode, mods, mounted }

    if (!canvas) return

    const chartParams = {
      mode: selectedMode,
      difficulty: selectedDifficulty,
      mods,
    }

    Object.keys(currentState).forEach((thing) => {
      if (prevState[thing] !== currentState[thing]) {
        if (thing === 'sm' || thing === 'mounted') {
          // console.log(
          //   `${thing} changed from ${
          //     prevState[thing]
          //       ? prevState[thing].slice(0, 30)
          //       : prevState[thing]
          //   } \n\nto ${currentState[thing].slice(0, 30)}`
          // );
          // flag the old game engine as killed, so any residual invocations
          // of its mainLoop can be squashed until it is garbage collected
          if (gameEngine) {
            gameEngine.killed = true
          }

          if (!sm) return

          const simfileType = selectedSong.useSsc ? 'ssc' : 'sm'

          const simfiles = parseSimfile(sm, simfileType)

          const simfile = simfiles[`${selectedMode}_${selectedDifficulty}`]
          if (simfile) {
            AudioPlayer.storePreviewSource(selectedSong, simfile)
          } else {
            console.log('caught undefined simfile')
          }

          // const numSongLevels = selectedSong.levels.filter((a) => a).length;
          // console.log("available song levels:", numSongLevels);
          // console.log("num loaded charts", simfiles.numLoadedCharts);

          let ge = new GameEngine(canvas, simfiles, chartParams, {
            mainEngine: true,
            AudioPlayer: AudioPlayer,
          })
          ge.pauseTl()
          setGameEngine(ge)
        } else if (thing === 'mods') {
          Object.keys(prevState.mods).forEach((mod) => {
            const prev = JSON.stringify(prevState.mods[mod])
            const curr = JSON.stringify(currentState.mods[mod])
            const modChanged = prev !== curr

            if (gameEngine && modChanged) {
              if (mod === 'bpmStopDisplay') {
                gameEngine.bpmReel = currentState.mods[mod] ? document.getElementById('bpmReel') : null
                gameEngine.stopReel = currentState.mods[mod] ? document.getElementById('stopReel') : null
              }

              if (mod === 'rate') {
                AudioPlayer.changeMusicRate(mods.rate)
              }

              if (['turn', 'shuffle', 'cut', 'freezes', 'jumps'].includes(mod)) {
                gameEngine.resetChart(chartParams)
              } else {
                // console.log(prev, curr);
                if (gameEngine.isTlPaused()) {
                  gameEngine.updateLoopOnce()
                }
              }
            }
          })
        }
        // mode or difficulty
        else {
          // console.log(
          //   `${thing} changed from ${prevState[thing]} to ${currentState[thing]}`
          // );
          if (gameEngine) {
            gameEngine.resetChart(chartParams)
          }
        }
      }
    })

    if (gameEngine) {
      gameEngine.updateExternalGlobalParams({ mods })
    }
  }, [canvas, sm, selectedDifficulty, selectedMode, mods, props.location])

  const shareParams = {
    song: selectedSong,
    difficulty: selectedDifficulty,
    mode: selectedMode,
    mods,
  }

  return (
    <div className={`view-section chartView ${screen.activeView === 'chart' ? 'active' : ''}`}>
      <div className="view-wrapper chartArea-container">
        <div className={`canvas-container ${selectedMode} ${mods.scroll}`} ref={canvasContainer}>
          <div className="chartArea-wrapper" ref={canvasWrapper}>
            <div className="chartArea-left-wrapper">
              {gameEngine && <BpmDisplay bpmQueue={gameEngine.globalParams.bpmQueue} />}
            </div>
            <div className="chartArea-right-wrapper">
              {gameEngine && <StopDisplay stopQueue={gameEngine.globalParams.stopQueue} />}
              {selectedSong && !loadingAudio && ['hidden', 'sudden', 'hiddensudden'].includes(mods.appearance) && (
                <CabButtons mods={mods} canvas={canvas} />
              )}
            </div>
            <div className="canvas-wrapper">
              <canvas id="chartArea" width="256" height="436" />
              <div
                className={`chart-loading-screen ${selectedMode} ${loadingAudio ? 'loading' : ''} `}
                ref={chartLoadingScreen}
              >
                {selectedSong && (
                  <img
                    className="chart-loading-jacket"
                    src={getJacketPath(`${selectedSong.hash}.png`)}
                    alt="chart loading jacket"
                  />
                )}
                <div className="chart-loading-message">Loading chart...</div>
              </div>
              <ModDisplay mods={mods} />
            </div>
          </div>
        </div>
        <div className="below-chart-area">
          <div className="progress-container">
            <div className="progress-wrapper">
              <canvas id="progress" />
              {presetParams.progress ? (
                <div
                  className="preset-marker-wrapper"
                  onClick={Progress.jumpToPresetStart.bind(Progress)}
                  onTouchStart={Progress.jumpToPresetStart.bind(Progress)}
                >
                  <div className="preset-marker" />
                </div>
              ) : null}
              <div className="progress-time">
                {selectedSong && !loadingAudio && (
                  <>
                    <span id="progressTimeMinutes">0:00</span>
                    <span>/</span>
                    <span id="progressTimeSeconds">0:00</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="row play-controls-row">
            <PlayControls
              controlsDisabled={!gameEngine || loadingAudio}
              setShareModalOpen={() => props.setModalOpen('share', true)}
            />
          </div>
          <div className="row song-info-area">
            <SongInfo />
            {selectedSong && (
              <div>
                <Button className="view-static-btn" onClick={() => props.setModalOpen('staticChart', true)}>
                  View static chart
                </Button>
              </div>
            )}
          </div>
        </div>
        <ShareModal modalOpen={screen.modalOpen.share} data={shareParams} />
        {gameEngine && <StaticModal modalOpen={screen.modalOpen.staticChart} gameEngine={gameEngine} />}
      </div>
    </div>
  )
}

const mapStateToProps = (state) => {
  const { mods, songSelect, screen, simfiles } = state
  return {
    mods,
    selectedSong: songSelect.song,
    selectedDifficulty: songSelect.difficulty,
    selectedMode: songSelect.mode,
    screen,
    sm: simfiles.sm,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartArea)
