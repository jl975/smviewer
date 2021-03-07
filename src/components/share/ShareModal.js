import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { Modal, Button, Input } from 'semantic-ui-react'
import copy from 'copy-to-clipboard'

import { getOriginPath } from '../../utils'
import Progress from '../chart/canvas/Progress'
import { setModalOpen } from '../../actions/ScreenActions'

const difficulties = {
  Beginner: 'b',
  Basic: 'B',
  Difficult: 'D',
  Expert: 'E',
  Challenge: 'C',
}

const modes = {
  single: 'S',
  double: 'D',
}

const ShareModal = (props) => {
  const { modalOpen, setModalOpen, data } = props
  const { song, difficulty, mode, mods } = data

  const shareUrl = useRef()
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (modalOpen === false) {
      setMessage('')
    }
  }, [modalOpen])

  if (!song) return null

  // console.log("ShareModal data", data);

  const generateShareUrl = () => {
    const progress = Progress.getProgress()

    const params = {
      song: song.hash,
      difficulty: difficulties[difficulty] + modes[mode] + 'P',
      turn: mods.turn !== 'off' ? mods.turn : '',
      speed: mods.speed.toString().replace('.', ''),
      progress: parseInt(progress * 100000),
    }

    const queryStr = Object.keys(params)
      .map((param) => {
        if (params[param] === null || typeof params[param] === 'undefined') {
          return null
        }
        return `${param}=${params[param]}`
      })
      .filter((param) => param !== null)
      .join('&')

    return getOriginPath() + '?' + queryStr
  }
  shareUrl.current = generateShareUrl()

  const copyShareUrl = () => {
    copy(shareUrl.current)
    setMessage('Copied link to clipboard')
  }

  const downloadScreenshot = () => {
    const canvas = document.getElementById('chartArea')
    const dataUrl = canvas.toDataURL('image/png', 1.0)
    const a = document.createElement('a')
    a.href = dataUrl

    // let filename = `${props.song.title} `;
    // filename += props.difficulty === "Beginner" ? "b" : props.difficulty.slice(0, 1);
    // filename += props.mode.slice(0, 1).toUpperCase();
    // filename += "P.png";

    const filename = 'screenshot.png'
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <Modal className="information-modal shareModal" open={modalOpen} onClose={() => setModalOpen('share', false)}>
      <Modal.Header>Share link to chart</Modal.Header>
      <Modal.Content>
        <Input type="text" className="share-url-input" value={shareUrl.current} action>
          <input />
          <Button onClick={copyShareUrl}>Copy</Button>
        </Input>
        <p>{message}</p>
        <div>
          <Button onClick={downloadScreenshot}>Download chart screenshot</Button>
        </div>
      </Modal.Content>
    </Modal>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
  }
}

export default connect(null, mapDispatchToProps)(ShareModal)
