import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { Modal, Input, Button, Icon } from 'semantic-ui-react'

import AudioPlayer, { OffsetAdjustAudioPlayer } from '../../core/AudioPlayer'
import { updateMods } from '../../actions/ModsActions'
import { setModalOpen } from '../../actions/ScreenActions'
import { getOriginPath, fetchDocument, renderWithSign } from '../../utils'
import parseSimfile from '../../utils/parseSimfile'
import GameEngine from '../../core/GameEngine'

const OffsetModal = (props) => {
  const { modalOpen, setModalOpen, mods, updateMods } = props
  const [gameEngine, setGameEngine] = useState(null)
  const [loadingAudio, setLoadingAudio] = useState(false)

  const [canvas, setCanvas] = useState(null)
  const canvasRef = useRef(null)

  const adjustedGlobalOffset = window.localStorage.getItem('adjustedGlobalOffset')

  const originalOffsetValue = useRef(mods.globalOffset)

  useEffect(() => {
    if (!modalOpen) return

    canvasRef.current = document.querySelector('#offsetChart')
    setCanvas(canvasRef.current)

    if (!canvas) return

    loadSimfile()

    // if a value for preconfirmOffset exists, it means the user did not confirm
    // whatever value is currently stored as the global offset.
    // reset the global offset to the preconfirmOffset value and delete preconfirmOffset
    if (typeof mods.preconfirmOffset === 'number') {
      console.log(`user did not confirm the globalOffset value of ${mods.globalOffset},
      switching to preconfirmOffset value of ${mods.preconfirmOffset}`)
      originalOffsetValue.current = mods.preconfirmOffset
      updateMods({ globalOffset: mods.preconfirmOffset, preconfirmOffset: null })
    }
  }, [canvas, modalOpen])

  const loadSimfile = async () => {
    // prepare audio
    const song = {
      title: '',
      audioUrl: 'offset_adjust.mp3',
      hash: 'OFFSET_ADJUST_AUDIO',
    }
    OffsetAdjustAudioPlayer.setLoadingAudio = setLoadingAudio
    await OffsetAdjustAudioPlayer.selectSong(song)

    // prepare chart
    const sm = await fetchDocument(`${getOriginPath()}simfiles/offset_adjust.sm`)
    const simfileObj = parseSimfile(sm, 'sm')
    const chartParams = {
      difficulty: 'Basic',
      mode: 'single',
      mods,
    }

    let ge = new GameEngine(canvas, simfileObj, chartParams, {
      mainEngine: false,
      AudioPlayer: OffsetAdjustAudioPlayer,
    })
    setGameEngine(ge)

    OffsetAdjustAudioPlayer.play(true)
  }

  const handleClose = async () => {
    await setModalOpen('offset', false)
    OffsetAdjustAudioPlayer.stop()

    setTimeout(() => {
      AudioPlayer.updateProgressOnce()
    }, 500)

    AudioPlayer

    if (gameEngine) {
      gameEngine.killed = true
    }
  }

  const handleOffsetChange = async (newOffset) => {
    await updateMods({
      globalOffset: newOffset,
      preconfirmOffset: originalOffsetValue.current,
    })
    OffsetAdjustAudioPlayer.resync()
  }

  const incrementOffset = () => {
    const newOffset = Math.round((mods.globalOffset + 0.01) * 100) / 100
    handleOffsetChange(newOffset)
  }
  const decrementOffset = () => {
    const newOffset = Math.round((mods.globalOffset - 0.01) * 100) / 100
    handleOffsetChange(newOffset)
  }

  const handleCancel = async () => {
    await updateMods({
      globalOffset: originalOffsetValue.current,
      preconfirmOffset: null,
    })
    handleClose()
  }

  const confirmOffset = async () => {
    originalOffsetValue.current = mods.globalOffset
    await updateMods({ preconfirmOffset: null })

    await handleClose()

    if (!adjustedGlobalOffset) {
      setModalOpen('offsetConfirm')
    }
  }

  return (
    <Modal open={modalOpen} className="offsetModal">
      <h3>Set global offset</h3>
      <div className="offsetChart-container">
        <canvas id="offsetChart" width="256" height="448" />
        {loadingAudio && <div></div>}
      </div>
      <div className="slider-container">
        <Button className="offset-adjust-btn" onClick={decrementOffset}>
          <div className="adjust-sign">
            <Icon name="minus" />
          </div>
          <div className="adjust-label">Later</div>
        </Button>
        <div className="slider-wrapper">
          <Input
            type="range"
            name="globalOffset"
            min="-0.20"
            max="0.20"
            step="0.01"
            value={mods.globalOffset}
            onChange={(_, data) => {
              handleOffsetChange(parseFloat(data.value))
            }}
          />
          <div className="offset-value">
            <strong>{renderWithSign(mods.globalOffset, 2)}</strong>
            {adjustedGlobalOffset && <span>&nbsp;(previous: {renderWithSign(originalOffsetValue.current, 2)})</span>}
          </div>
        </div>
        <Button className="offset-adjust-btn" onClick={incrementOffset}>
          <div className="adjust-sign">
            <Icon name="plus" />
          </div>
          <div className="adjust-label">Earlier</div>
        </Button>
      </div>
      <p className="description-blurb">
        The earlier the offset is (in seconds), the earlier the notes will line up with the step zone relative to the
        music.
      </p>
      <div className="modal-actions">
        {adjustedGlobalOffset && <Button onClick={handleCancel}>Cancel</Button>}
        <Button onClick={confirmOffset}>Confirm</Button>
      </div>
    </Modal>
  )
}

const mapStateToProps = (state) => {
  const { mods, screen } = state
  return {
    mods,
    screen,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateMods: (mods) => dispatch(updateMods(mods)),
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OffsetModal)
