import React from "react";
import { connect } from "react-redux";
import { Modal, Button } from "semantic-ui-react";

import { setModalOpen, setActiveView } from "../../actions/ScreenActions";

const SettingsModal = (props) => {
  const { modalOpen, setModalOpen, setActiveView } = props;

  const handleClose = () => {
    setModalOpen("settings", false);
    setActiveView(props.previousActiveView);
  };

  return (
    <Modal open={modalOpen} className="page-modal settingsModal">
      <div>Settings modal</div>
      <div className="modal-actions">
        <Button onClick={handleClose}>Close</Button>
      </div>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  const { screen } = state;
  return {
    activeView: screen.activeView,
    previousActiveView: screen.previousActiveView,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
    setActiveView: (view) => dispatch(setActiveView(view)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SettingsModal);
