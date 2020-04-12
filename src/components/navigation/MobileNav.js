import React from "react";
import { Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import AudioPlayer from "../../core/AudioPlayer";
import { stopPreviewAudio } from "../../actions/AudioActions";

const MobileNav = (props) => {
  const { activeView, chartAudio, previewAudio } = props;

  const navItems = [
    { view: "chart", icon: "arrow up" },
    { view: "song", icon: "music" },
    { view: "2", icon: "" },
    { view: "3", icon: "" },
    { view: "mods", icon: "sidebar" },
  ];

  const setActiveView = (view) => {
    if (view === "song" && chartAudio.status === "playing") return;
    AudioPlayer.stopSongPreview();
    props.setActiveView(view);
  };

  const isDisabled = (view) => {
    if (view === "song" && chartAudio.status === "playing") return true;
    return false;
  };

  return (
    <nav className="mobileNav">
      {navItems.map((navItem) => {
        const { view, icon } = navItem;
        if (!view) return <div className="mobileNav_item" />;
        return (
          <div
            key={`mobileNavItem_${view}`}
            className={`mobileNav_item ${activeView === view ? "active" : ""} ${
              isDisabled(view) ? "disabled" : ""
            }`}
            onClick={() => setActiveView(view)}
          >
            <Icon name={icon} />
          </div>
        );
      })}
    </nav>
  );
};

const mapStateToProps = (state) => {
  const { audio } = state;
  const { chartAudio, previewAudio } = audio;
  return {
    chartAudio,
    previewAudio,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    stopPreviewAudio: () => dispatch(stopPreviewAudio()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MobileNav);
