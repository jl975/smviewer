import React, { useEffect } from "react";
import { Icon } from "semantic-ui-react";
import { connect } from "react-redux";
// import {  } from 'react-router-dom'

import AudioPlayer from "../../core/AudioPlayer";
import { stopPreviewAudio } from "../../actions/AudioActions";
import { setActiveView, setModalOpen, closeAllModals } from "../../actions/ScreenActions";
import { ReactComponent as ChartIcon } from "../../svg/arrows.svg";
import { ReactComponent as ModsIcon } from "../../svg/mods.svg";
import { ReactComponent as SongIcon } from "../../svg/music_search.svg";
// import { DEBUG_MODE } from "../../constants";

const Navbar = (props) => {
  const { activeView, chartAudio, history } = props;

  const navItems = [
    { view: "song", icon: "music", svgIcon: SongIcon, text: "Song", path: "/" },
    { view: "mods", icon: "sidebar", svgIcon: ModsIcon, text: "Mods", path: "/" },
    { view: "chart", svgIcon: ChartIcon, text: "Chart", path: "/" },
    { view: "settings", modal: "settings", icon: "setting", text: "Settings", path: "/" },
    { view: "help", modal: "help", icon: "help circle", text: "Help" },
    // { view: DEBUG_MODE ? "logView1" : "", icon: "", text: "" },
    // { view: "3", icon: "", text: "" },
  ];

  useEffect(() => {
    if (!activeView) return;
    const activeNavItem = navItems.find((navItem) => navItem.view === activeView);
    if (!activeNavItem) return;
    if (activeNavItem.modal) {
      changeActiveView(navItems.find((navItem) => navItem.view === "song"));
    }
  }, []);

  const changeActiveView = (navItem) => {
    const { view, path, modal } = navItem;
    if (chartAudio.status === "playing") {
      AudioPlayer.pause();
    }
    AudioPlayer.stopSongPreview();

    if (view) {
      props.setActiveView(view);

      if (path) {
        history.push(navItem.path);
      }
    }
    if (modal) {
      props.setModalOpen(modal, true);
    } else {
      props.closeAllModals();
    }

    // const navItem = navItems.find((item) => item.view === view);
  };

  const isDisabled = () => {
    // if (view !== "chart" && chartAudio.status === "playing") return true;
    return false;
  };

  return (
    <div className={`navbar-wrapper ${props.fullScreenModal ? "behind-modal" : ""}`}>
      <nav className="navbar">
        {navItems.map((navItem, i) => {
          const { view, icon, text, modal } = navItem;
          const SVGIcon = navItem.svgIcon;
          if (!view && !modal) return <div key={`navbarItem_${i}`} className="navbar_item" />;
          return (
            <div
              key={`navbarItem_${i}`}
              className={`navbar_item ${activeView === view ? "active" : ""} ${isDisabled(view) ? "disabled" : ""}`}
              onClick={() => changeActiveView(navItem)}
            >
              {SVGIcon ? <SVGIcon className={`svg-icon ${view}`} /> : <Icon name={icon} />}
              <span className="description">{text}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};

const mapStateToProps = (state) => {
  const { audio, screen } = state;
  const { chartAudio } = audio;
  return {
    chartAudio,
    activeView: screen.activeView,
    fullScreenModal: screen.fullScreenModal,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    stopPreviewAudio: () => dispatch(stopPreviewAudio()),
    setActiveView: (view) => dispatch(setActiveView(view)),
    setModalOpen: (modalName, isOpen) => dispatch(setModalOpen(modalName, isOpen)),
    closeAllModals: () => dispatch(closeAllModals()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
