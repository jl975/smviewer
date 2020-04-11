import React from "react";
import { Icon } from "semantic-ui-react";
import AudioPlayer from "../../core/AudioPlayer";

const MobileNav = (props) => {
  const { activeView, audioPlaying } = props;

  const navItems = [
    { view: "main", icon: "arrow up" },
    { view: "song", icon: "music" },
    { view: "2", icon: "" },
    { view: "3", icon: "" },
    { view: "mods", icon: "sidebar" },
  ];

  const setActiveView = (view) => {
    if (view === "song" && audioPlaying) return;
    props.setActiveView(view);
  };

  const isDisabled = (view) => {
    if (view === "song" && audioPlaying) return true;
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

export default MobileNav;
