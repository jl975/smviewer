import React from 'react'
import { connect } from 'react-redux'
import { Modal, Button } from 'semantic-ui-react'

import { setModalOpen } from '../../actions/ScreenActions'

const WelcomeModal = (props) => {
  const { modalOpen, setModalOpen } = props

  const openOffsetModal = () => {
    setModalOpen('offset', true)
  }

  return (
    <Modal open={modalOpen} className="information-modal welcomeModal">
      <div className="welcome-blurb">
        <p>Welcome to {process.env.REACT_APP_TITLE}!</p>
        <p>First, calibrate the app&#39;s global offset to ensure the charts are in sync with the audio.</p>
      </div>
      <div className="modal-actions">
        <Button onClick={openOffsetModal}>OK</Button>
      </div>
    </Modal>
  )
}

const mapDispatchToProps = (dispatch) => {
  return {
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
  }
}

export default connect(null, mapDispatchToProps)(WelcomeModal)
