import React from "react";
import { Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import AudioPlayer from "../../core/AudioPlayer";
import { stopPreviewAudio } from "../../actions/AudioActions";
import { setActiveView } from "../../actions/ScreenActions";
import { ReactComponent as ChartIcon } from "../../svg/arrows.svg";
import { ReactComponent as ModsIcon } from "../../svg/mods.svg";
import { ReactComponent as SongIcon } from "../../svg/music_search.svg";
// import { DEBUG_MODE } from "../../constants";

const Navbar = (props) => {
  const { activeView, chartAudio } = props;

  const navItems = [
    { view: "song", icon: "music", svgIcon: SongIcon, text: "Song" },
    { view: "mods", icon: "sidebar", svgIcon: ModsIcon, text: "Mods" },
    { view: "chart", svgIcon: ChartIcon, text: "Chart" },
    { view: "settings", icon: "setting", text: "Settings" },
    { view: "help", icon: "help circle", text: "Help" },
    // { view: DEBUG_MODE ? "logView1" : "", icon: "", text: "" },
    // { view: "3", icon: "", text: "" },
  ];

  const changeActiveView = (view) => {
    if (chartAudio.status === "playing") {
      AudioPlayer.pause();
    }
    AudioPlayer.stopSongPreview();
    props.setActiveView(view);
  };

  const isDisabled = () => {
    // if (view !== "chart" && chartAudio.status === "playing") return true;
    return false;
  };

  return (
    <nav className="navbar">
      {navItems.map((navItem, i) => {
        const { view, icon, text } = navItem;
        const SVGIcon = navItem.svgIcon;
        if (!view) return <div key={`navbarItem_${i}`} className="navbar_item" />;
        return (
          <div
            key={`navbarItem_${i}`}
            className={`navbar_item ${activeView === view ? "active" : ""} ${isDisabled(view) ? "disabled" : ""}`}
            onClick={() => changeActiveView(view)}
          >
            {SVGIcon ? <SVGIcon className={`svg-icon ${view}`} /> : <Icon name={icon} />}
            <span className="description">{text}</span>
          </div>
        );
      })}
    </nav>
  );
};

const mapStateToProps = (state) => {
  const { audio, screen } = state;
  const { chartAudio } = audio;
  return {
    chartAudio,
    activeView: screen.activeView,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    stopPreviewAudio: () => dispatch(stopPreviewAudio()),
    setActiveView: (view) => dispatch(setActiveView(view)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navbar);
