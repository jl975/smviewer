import React from "react";
import { connect } from "react-redux";
import { Modal } from "semantic-ui-react";

import { setModalOpen } from "../../actions/ScreenActions";

const HelpModal = (props) => {
  const { modalOpen } = props;

  return (
    <Modal open={modalOpen} className="page-modal helpModal">
      <h3>Help</h3>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  const { screen } = state;
  return { screen };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HelpModal);
