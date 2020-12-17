import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Modal, Button } from "semantic-ui-react";

import { setModalOpen } from "../../actions/ScreenActions";
import { renderWithSign } from "../../utils";

const OffsetConfirmModal = (props) => {
  const { modalOpen, setModalOpen, mods } = props;

  useEffect(() => {
    if (!modalOpen) return;

    window.localStorage.setItem("adjustedGlobalOffset", true);
  }, [modalOpen]);

  const handleClose = () => {
    setModalOpen("offsetConfirm", false);
  };

  return (
    <Modal open={modalOpen} className="information-modal offsetConfirmModal">
      <p>
        Global offset was successfully set to <strong>{renderWithSign(mods.globalOffset, 2)}</strong>.
      </p>
      <p>You can readjust this value at any time in the Settings menu.</p>
      <div className="modal-actions">
        <Button onClick={handleClose}>OK</Button>
      </div>
    </Modal>
  );
};

const mapStateToProps = (state) => {
  const { mods, screen } = state;
  return { mods, screen };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(OffsetConfirmModal);
