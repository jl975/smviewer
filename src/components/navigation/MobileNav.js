import React from "react";
import { Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import AudioPlayer from "../../core/AudioPlayer";
import { stopPreviewAudio } from "../../actions/AudioActions";
import { setActiveView } from "../../actions/ScreenActions";
import { ReactComponent as ChartIcon } from "../../svg/arrows.svg";
import { ReactComponent as ModsIcon } from "../../svg/mods.svg";
import { ReactComponent as SongIcon } from "../../svg/music_search.svg";

const MobileNav = (props) => {
  const { activeView, chartAudio, previewAudio } = props;

  const navItems = [
    { view: "song", icon: "music", svgIcon: SongIcon, text: "Song" },
    { view: "mods", icon: "sidebar", svgIcon: ModsIcon, text: "Mods" },
    { view: "2", icon: "", text: "" },
    { view: "3", icon: "", text: "" },
    { view: "chart", svgIcon: ChartIcon, text: "Chart" },
  ];

  const changeActiveView = (view) => {
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
            onClick={() => changeActiveView(view)}
          >
            {SVGIcon ? (
              <SVGIcon className={`svg-icon ${view}`} />
            ) : (
              <Icon name={icon} />
            )}
            <span className="description">{text}</span>
          </div>
        );
      })}
    </nav>
  );
};

const mapStateToProps = (state) => {
  const { audio, screen } = state;
  const { chartAudio, previewAudio } = audio;
  return {
    chartAudio,
    previewAudio,
    activeView: screen.activeView,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    stopPreviewAudio: () => dispatch(stopPreviewAudio()),
    setActiveView: (view) => dispatch(setActiveView(view)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MobileNav);
