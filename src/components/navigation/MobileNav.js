import React from "react";
import { Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import AudioPlayer from "../../core/AudioPlayer";
import { stopPreviewAudio } from "../../actions/AudioActions";
import { ReactComponent as ChartIcon } from "../../svg/arrows.svg";

const MobileNav = (props) => {
  const { activeView, chartAudio, previewAudio } = props;

  const navItems = [
    { view: "song", icon: "music", text: "Song" },
    { view: "mods", icon: "sidebar", text: "Mods" },
    { view: "2", icon: "", text: "" },
    { view: "3", icon: "", text: "" },
    { view: "chart", svgIcon: ChartIcon, text: "Chart" },
  ];

  const setActiveView = (view) => {
    if (chartAudio.status === "playing") return;
    AudioPlayer.stopSongPreview();
    props.setActiveView(view);
  };

  const isDisabled = (view) => {
    if (view !== "chart" && chartAudio.status === "playing") return true;
    return false;
  };

  return (
    <nav className="mobileNav">
      {navItems.map((navItem) => {
        const { view, icon, text } = navItem;
        const SVGIcon = navItem.svgIcon;
        if (!view) return <div className="mobileNav_item" />;
        return (
          <div
            key={`mobileNavItem_${view}`}
            className={`mobileNav_item ${activeView === view ? "active" : ""} ${
              isDisabled(view) ? "disabled" : ""
            }`}
            onClick={() => setActiveView(view)}
          >
            {SVGIcon ? <SVGIcon className="svg-icon" /> : <Icon name={icon} />}
            <span className="description">{text}</span>
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
